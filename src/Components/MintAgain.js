import { clusterApiUrl, Connection, Keypair, sendAndConfirmTransaction, Transaction } from "@solana/web3.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token"

export default function MintAgain(props) {

    const mintAgainHelper= async () => {
        try {
            const connection = new Connection(
                clusterApiUrl("devnet"),
                "confirmed"
            );
            const createMintingWallet = Keypair.fromSecretKey(Uint8Array.from(Object.values(JSON.parse(props.sk))));
            const mintRequester = await props.pro.publicKey;
            
            const fromAirDropSignature = await connection.requestAirdrop(createMintingWallet.publicKey,LAMPORTS_PER_SOL);
            await connection.confirmTransaction(fromAirDropSignature, { commitment: "confirmed" });
            
            const creatorToken = new Token(connection, props.pk, TOKEN_PROGRAM_ID, createMintingWallet);

            const fromTokenAccount = await creatorToken.getOrCreateAssociatedAccountInfo(createMintingWallet);
            const toTokenAccount = await creatorToken.getOrCreateAssociatedAccountInfo(mintRequester);
            await creatorToken.mintTo(fromTokenAccount.address, createMintingWallet.publicKey, [], 100000000);
            
            const transaction = new Transaction().add(
                Token.createTransferInstruction(
                    TOKEN_PROGRAM_ID,
                    fromTokenAccount.address,
                    toTokenAccount.address,
                    createMintingWallet.publicKey,
                    [],
                    1000000
                )
            );
            await sendAndConfirmTransaction(connection, transaction, [createMintingWallet], { commitment: "confirmed" });
        } 
        catch(err) {
            console.log(err);
        }
    }

    return (
        <div>
            <p>
                Mint more tokens: <button onClick={mintAgainHelper}> Mint again </button>
            </p>
        </div>
    )
}