import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { clusterApiUrl, Connection, PublicKey, Keypair, sendAndConfirmTransaction, Transaction } from "@solana/web3.js";
import { useState } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import MintAgain from "./MintAgain";

export default function CreateToken(props) {

    const [isTokenCreated,setIsTokenCreated] = useState(false);
    const [createdTokenPublicKey,setCreatedTokenPublicKey] = useState(null)	
    const [mintingWalletSecretKey,setMintingWalletSecretKey] = useState(null)

    const initialMintHelper = async () => {
        try {
            props.load(true)
            const connection = new Connection(
                clusterApiUrl("devnet"),
                "confirmed"
            )

            const mintRequester = await props.pro.publicKey
            const mintingFromWallet = await Keypair.generate()
            setMintingWalletSecretKey(JSON.stringify(mintingFromWallet.secretKey))

            const fromAirDropSignature = await connection.requestAirdrop(mintingFromWallet.publicKey, LAMPORTS_PER_SOL);
            await connection.confirmTransaction(fromAirDropSignature, { commitment: "confirmed" });

            const creatorToken = await Token.createMint(connection, mintingFromWallet, mintingFromWallet.publicKey, null, 6, TOKEN_PROGRAM_ID);
            const fromTokenAccount = await creatorToken.getOrCreateAssociatedAccountInfo(mintingFromWallet.publicKey);
            await creatorToken.mintTo(fromTokenAccount.address, mintingFromWallet.publicKey, [], 1000000);

            const toTokenAccount = await creatorToken.getOrCreateAssociatedAccountInfo(mintRequester)
            const transaction = new Transaction().add(
                Token.createTransferInstruction(
                    TOKEN_PROGRAM_ID,
                    fromTokenAccount.address,
                    toTokenAccount.address,
                    mintingFromWallet.publicKey,
                    [],
                    1000000
                )
            )

            const signature = await sendAndConfirmTransaction(connection, transaction, [mintingFromWallet], {commitment:"confirmed"})
            console.log("SIGNATURE: ", signature)

            setCreatedTokenPublicKey(props.pro.publicKey.toString())
            setIsTokenCreated(true)
            props.load(false)
        }
        catch(err) {
            console.log(err)
        }
    }

    const transferTokenHelper = async () => {
        try {           
           const connection = new Connection(
              clusterApiUrl("devnet"),
              "confirmed"
           );
           
           const createMintingWallet = Keypair.fromSecretKey(Uint8Array.from(Object.values(JSON.parse(mintingWalletSecretKey))));
           const receiverWallet = new PublicKey("4gqpe7y1zsDpR9LNi1S2y2Pu9G5EUHnm1FqdbU3GDPsw");
           const senderWallet = await props.pro.publicKey
           
           const fromAirDropSignature = await connection.requestAirdrop(createMintingWallet.publicKey, LAMPORTS_PER_SOL);
           await connection.confirmTransaction(fromAirDropSignature, { commitment: "confirmed" });
           console.log('1 SOL airdropped to the wallet for fee');
           
           const creatorToken = new Token(connection, createdTokenPublicKey, TOKEN_PROGRAM_ID, createMintingWallet)
           console.log(creatorToken.getOrCreateAssociatedAccountInfo)
           const fromTokenAccount = await creatorToken.getOrCreateAssociatedAccountInfo(senderWallet)
           console.log(fromTokenAccount)
           const toTokenAccount = await creatorToken.getOrCreateAssociatedAccountInfo(receiverWallet)
           console.log(toTokenAccount)
           
           const transaction = new Transaction().add(
              Token.createTransferInstruction(TOKEN_PROGRAM_ID, fromTokenAccount.address, toTokenAccount.address, props.pro.publicKey, [], 10000000)
           )
           transaction.feePayer=props.pro.publicKey;
           let blockhashObj = await connection.getRecentBlockhash();
           console.log("blockhashObj", blockhashObj);
           transaction.recentBlockhash = await blockhashObj.blockhash;
     
           if (transaction) {
              console.log("Txn created successfully");
           }
           
           let signed = await props.pro.signTransaction(transaction);
           let signature = await connection.sendRawTransaction(signed.serialize());
           await connection.confirmTransaction(signature);
           
           console.log("SIGNATURE: ", signature);
        } 
        catch(err) {
           console.log(err)
        }
     }

    return (
        <div>
            {
                props.walCon?(
                <p> Create your own token 
                    <button onClick={initialMintHelper}> Initial Mint </button>
                    <MintAgain pro={props.pro} walCon={props.walCon} sk={mintingWalletSecretKey} pk={createdTokenPublicKey}/>
                <li>
                Transfer token to your friends: 
                <button onClick={transferTokenHelper}> Transfer a token </button>
                </li>
                </p>
                ):<></>
            }
        </div>
    )
}