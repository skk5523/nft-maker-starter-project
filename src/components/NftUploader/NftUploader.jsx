import { ethers } from "ethers";
import Web3Mint from "../../utils/Web3Mint.json";
import { Button } from "@mui/material";
import React from "react";
import { useEffect, useState } from 'react'
import ImageLogo from "./image.svg";
import "./NftUploader.css";
import Animation from "../Animation/Animation";

// Import the NFTStorage class and File constructor from the 'nft.storage' package
import { NFTStorage } from 'nft.storage'
// The 'mime' npm package helps us set the correct file type on our File objects
import mime from 'mime'
// // Paste your NFT.Storage API key into the quotes:
const NFT_STORAGE_KEY = process.env.REACT_APP_NFT_STORAGE_KEY;
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

const OPENSEA_LINK = "https://testnets.opensea.io/ja/collection/nft-rpo9amab3x";

const NftUploader = () => {
  /*
   * ユーザーのウォレットアドレスを格納するために使用する状態変数を定義します。
   */
  const [currentAccount, setCurrentAccount] = useState("");
  const [isOnGoerli, setIsOnGoerli] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isImageReceived, setIsImageReceived] = useState(false);
  const [isMintingInProgress, setIsMintingInProgress] = useState(false);
  const [tokenCounter, setTokenCounter] = useState("");

  /*この段階でcurrentAccountの中身は空*/
  // console.log("currentAccount: ", currentAccount);
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
      
      let chainId = await ethereum.request({ method: "eth_chainId" });
      console.log("Connected to chain " + chainId);
      // 0x5 は Goerli の ID です。
      const goerliChainId = "0x5";
      setIsOnGoerli(chainId === goerliChainId);
      
    } else {
      console.log("No authorized account found");
    }
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

      let chainId = await ethereum.request({ method: "eth_chainId" });
      // console.log("Connected to chain " + chainId);
      // 0x5 は Goerli の ID です。
      const goerliChainId = "0x5";
      setIsOnGoerli(chainId === goerliChainId);
    } catch (error) {
      console.log(error);
    }
  };

  const setCurrentTokenId = async () => {
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
        setTokenCounter((await connectedContract.getCurrentTokenId()).toString());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
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
        setIsMintingInProgress(true);
        console.log("Mining...please wait.");
        await nftTxn.wait();
        setIsMintingInProgress(false);
        alert(
          `Mined, see transaction: https://goerli.etherscan.io/tx/${nftTxn.hash}`
        );
        setIsImageReceived(false);
        setCurrentTokenId((await connectedContract.getCurrentTokenId()).toString());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };
  
  const renderPrePage = () => (
    <>
      {currentAccount === "" && (
        <button onClick={connectWallet} className="connectWalletButton">
          Connect to Wallet
        </button>
      )}
      {currentAccount && !isOnGoerli && (
          <p>Please switch to the Goerli network!</p>
      )}
    </>    
  );

   /*
    * ページがロードされたときに useEffect()内の関数が呼び出されます。
    */
   useEffect(() => {
     checkIfWalletIsConnected();
   }, []);

  useEffect(() => {
    setCurrentTokenId();
  }, [currentAccount]);
  
  const imageToNFT = async (e) => {
    setIsImageReceived(true);
    const images = e.target.files;
    // create a new NFTStorage client using our API key
    const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY })
    
    for (const image of images) {
      // call client.store, passing in the image & metadata
      setIsUploading(true);
      const cid = await nftstorage.storeBlob(image);
      setIsUploading(false);

      console.log(cid);
      askContractToMintNft(cid);
    }
  }

  return (
    <div className="outerBox">
      <div className="title">
        <h2>NFTアップローダー</h2>
        {currentAccount && isOnGoerli && (
          <p>NFTs minted so far: {tokenCounter}</p>
        )}
      </div>
      {renderPrePage()}
      {currentAccount && isOnGoerli && !isImageReceived && !isUploading && (
        <>
          <p>If you choose image, you can mint your NFT</p>
          <div className="nftUplodeBox">
            <div className="imageLogoAndText">
              <img src={ImageLogo} alt="imagelogo" />
              <p>ここにドラッグ＆ドロップしてね</p>
            </div>
            <input className="nftUploadInput" multiple name="imageURL" type="file" accept=".jpg , .jpeg , .png" onChange={imageToNFT}  />
          </div>
          <p>または</p>
          <Button variant="contained">
            ファイルを選択
            <input className="nftUploadInput" type="file" accept=".jpg , .jpeg , .png" onChange={imageToNFT} />
          </Button>
        </>
      )}
      {currentAccount && isUploading && (
        <Animation text="Uploading image..." />
      )}
      {currentAccount && !isUploading && isImageReceived && !isMintingInProgress && (
        <p>Please confirm the transaction on your wallet!</p>
      )}
      {currentAccount && isMintingInProgress && (
        <Animation text="Minting..." />
      )}
      <div className="footer">
        <a href={OPENSEA_LINK}>See the collection</a>
      </div>
    </div>
  );
};

export default NftUploader;