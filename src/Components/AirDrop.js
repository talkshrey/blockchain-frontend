import { clusterApiUrl, Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js"

export default function AirDrop(props) {

    const airDropHelper = async () => {
        try {
            props.load(true)
            const connection = new Connection(
                clusterApiUrl("devnet"),
                "confirmed"
            )
            const fromAirDropSignature = await connection.requestAirdrop(new PublicKey(props.pro.publicKey), LAMPORTS_PER_SOL)
            await connection.confirmTransaction(fromAirDropSignature, { commitment: "confirmed" })

            console.log(`1 SOL airdropped to your wallet ${props.pro.publicKey.toString()} successfully`)
            props.load(false)
        }
        catch(err) {
            console.log(err)
            props.load(false)
        }
    }
    return (
        <div>
            {
                props.walCon?(
                    <p>AirDrop 1 SOLANA into your wallet
                    <button onClick={airDropHelper}> AirDrop SOL </button>
                    </p>
                )
                :<></>
            }
        </div>
    )
}