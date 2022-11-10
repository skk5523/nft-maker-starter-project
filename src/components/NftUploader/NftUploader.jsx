import { ethers } from "ethers";
import { Button } from "@mui/material";
import React from "react";
import { useEffect, useState } from "react";
import ImageLogo from "./image.svg";
import "./NftUploader.css";
import Web3Mint from "../../utils/Web3Mint.json";
import { Web3Storage } from "web3.storage";

const NftUploader = () => {
  const CONTRACT_ADDRESS = "0xccDb12DDadcF8218c4dda0beeD960985eA21CA8E";
  /*
  * ユーザーのウォレットアドレスを格納するために使用する状態変数を定義します。
  */
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOnGoerli, setIsOnGoerli] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  /*この段階でcurrentAccountの中身は空*/
  console.log("currentAccount: ", currentAccount);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have MetaMask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }
    const accounts = await ethereum.request({ method: "eth_accounts" });
    
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
    } else {
      console.log("No authorized account found");
    }

    let chainId = await ethereum.request({ method: "eth_chainId" });
    console.log("Connected to chain " + chainId);
    // 0x5 は Goerli の ID です。
    const goerliChainId = "0x5";

    setIsOnGoerli(chainId === goerliChainId);
    // if (chainId !== goerliChainId) {
    //   alert("You are not connected to the Goerli Test Network!");
    // }
  };

  const connectWallet = async () =>{
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      /*
       * ウォレットアドレスに対してアクセスをリクエストしています。
       */
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected", accounts[0]);
      /*
       * ウォレットアドレスを currentAccount に紐付けます。
       */
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async (ipfs) => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          Web3Mint.abi,
          signer
        );
        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.mintIpfsNFT("sample",ipfs);
        console.log("Mining...please wait.");
        setIsLoading(true);
        await nftTxn.wait();
        setIsLoading(false);
        console.log(
          `Mined, see transaction: https://goerli.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const imageToNFT = async (e) => {
    // const API_KEY = process.env.WEB3STORAGE_API_KEY;
    const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGQyOTgxOWQ0YTlDNUM4ZDM4ZjVFRUMzYTU3MzBFRUFDODAxNDVCYjMiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjU3MTQxNTUzNjUsIm5hbWUiOiJFVEgtTkZULU1ha2VyIn0.Xv5q_vAIxVPQGaAVMi76gigp0zpCaOsSZVdWmH4Ior8";
    const client = new Web3Storage({ token: API_KEY })
    const image = e.target
    console.log(image)

    const rootCid = await client.put(image.files, {
        name: 'experiment',
        maxRetries: 3
    })
    setIsUploading(true);
    const res = await client.get(rootCid) // Web3Response
    const files = await res.files() // Web3File[]
    setIsUploading(false);
    for (const file of files) {
      console.log("file.cid:",file.cid)
      askContractToMintNft(file.cid)
    }
  };
    
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );
  
  const renderSwitchNetwork = () => (
    <p className="text-warning">Please switch to Goerli network!</p>
  );
  
  const renderImageUploader = () => (
    <>
      <p>JpegかPngの画像ファイル</p>
      <div className="nftUplodeBox">
        <div className="imageLogoAndText">
          <img src={ImageLogo} alt="imagelogo" />
          <p>ここにドラッグ＆ドロップしてね</p>
        </div>
        <input className="nftUploadInput" multiple name="imageURL" type="file" accept=".jpg , .jpeg , .png" onChange={imageToNFT} />
      </div>
      <p>または</p>
      <Button variant="contained">
        ファイルを選択
        <input className="nftUploadInput" type="file" accept=".jpg , .jpeg , .png" onChange={imageToNFT} />
      </Button>
      {isUploading ? <p>Uploading your image file...</p> : <p></p>}
    </>
  );

  /*
  * ページがロードされたときに useEffect()内の関数が呼び出されます。
   */
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    const { ethereum } = window;
    if (!ethereum || !currentAccount) return;

    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const connectedContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      Web3Mint.abi,
      signer
    );

    if (!connectedContract || !isOnGoerli) return;

  });

  useEffect(() => {
    renderImageUploader();
    renderSwitchNetwork();
  }, [isUploading, isOnGoerli]);

  return (
    <div className="outerBox">
      <div className="title">
        <h2>NFTアップローダー</h2>
        <p>If you choose image, you can mint your NFT</p>
      </div>
      {currentAccount === "" ? (
        renderNotConnectedContainer()
      ) : !isOnGoerli ? 
        renderSwitchNetwork()
        : (
          <>
          </>
        ) &&
        (!isLoading ? 
          renderImageUploader() 
          : <p>Minting...</p>)
        }

    </div>
  );
};

export default NftUploader;