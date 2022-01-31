import { useState } from "react";
import AirDrop from "./AirDrop";
import CreateToken from "./CreateToken";

export default function Wallet() {
    const [walletConnected, setWalletConnected] = useState(false)
    const [provider, setProvider] = useState()
    const [loading, setLoading] = useState()

    const getProvider = async () => {
        if ("solana" in window) {
           const prov = window.solana
           if (prov.isPhantom) {
              return prov
           }
        } 
        else {
           window.open("https://www.phantom.app/", "_blank")
        }
     }

    const walletConnectionHelper = async () => {
        if(walletConnected) {
            setProvider()
            setWalletConnected(false)
        }
        else {
            const userWallet = await getProvider()
            if(userWallet) {
                await userWallet.connect()
                userWallet.on("connect", async()=> {
                    setProvider(userWallet)
                    setWalletConnected(true)
                })
            }
        }
    }

    return (
        <div>
            {
                walletConnected?(
                    <div>
                    <p><strong>Public key: </strong> {provider.publicKey.toString()} </p>
                    <AirDrop load={setLoading} pro={provider} walCon={walletConnected}/>
                    <CreateToken load={setLoading} pro={provider} walCon={walletConnected}/>
                    </div>
                ):<p></p>
            }
            <button onClick={walletConnectionHelper} disabled={loading}>
                {!walletConnected?"Connect Wallet":"Disconnect Wallet"}
            </button>
        </div>
    )
}