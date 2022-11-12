import { ethers } from "ethers";
import Web3Mint from "../../utils/Web3Mint.json";
import { Button } from "@mui/material";
import React from "react";
import { useEffect, useState } from 'react'
import ImageLogo from "./image.svg";
import "./NftUploader.css";
// require('dotenv').config();

// Import the NFTStorage class and File constructor from the 'nft.storage' package
import { NFTStorage } from 'nft.storage'
// The 'mime' npm package helps us set the correct file type on our File objects
import mime from 'mime'
// // Paste your NFT.Storage API key into the quotes:
const NFT_STORAGE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDkwODlGQ2NmMThkOTg2MzU0QzBjY0Q1RmFDMGRGZkY3NDVkY2Y4MEIiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY2ODE3MjE5MTAyOSwibmFtZSI6IkVUSC1ORlQtTWFrZXIifQ.yXF1xDOkicuDkxHg54nCb9eMFi4D6xPHo-DsGk67T6E'

const NftUploader = () => {
  /*
   * ユーザーのウォレットアドレスを格納するために使用する状態変数を定義します。
   */
  const [currentAccount, setCurrentAccount] = useState("");
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
    const CONTRACT_ADDRESS =
      "0xccDb12DDadcF8218c4dda0beeD960985eA21CA8E";
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
        await nftTxn.wait();
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
  
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
        Connect to Wallet
      </button>
    );
    /*
    * ページがロードされたときに useEffect()内の関数が呼び出されます。
    */
   useEffect(() => {
     checkIfWalletIsConnected();
    }, []);
  
  const imageToNFT = async (e) => {
    const images = e.target.files;
    // create a new NFTStorage client using our API key
    const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY })
    
    for (const image of images) {
      // call client.store, passing in the image & metadata
      const cid = await nftstorage.storeBlob(image);
      console.log(cid);
      askContractToMintNft(cid);
    }
  }

  return (
    <div className="outerBox">
      {currentAccount === "" ? (
        renderNotConnectedContainer()
      ) : (
        <p>If you choose image, you can mint your NFT</p>
      )}
      <div className="title">
        <h2>NFTアップローダー</h2>
      </div>
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
    </div>
  );
};

export default NftUploader;