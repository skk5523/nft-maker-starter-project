import { ethers } from "ethers";
import Web3Mint from "../../utils/Web3Mint.json";
import { Button } from "@mui/material";
import React from "react";
import { useEffect, useState } from 'react'
import ImageLogo from "./image.svg";
import "./NftUploader.css";
import { Web3Storage } from 'web3.storage'

// require('dotenv').config();

// Import the NFTStorage class and File constructor from the 'nft.storage' package
import { NFTStorage, File } from 'nft.storage'
// The 'mime' npm package helps us set the correct file type on our File objects
import mime from 'mime'
// The 'fs' builtin module on Node.js provides access to the file system
// import fs from 'fs'
// // The 'path' module provides helpers for manipulating filesystem paths
// import path from 'path'
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

  /**
    * Reads an image file from `imagePath` and stores an NFT with the given name and description.
    * @param {string} imagePath the path to an image file
    * @param {string} name a name for the NFT
    * @param {string} description a text description for the NFT
    */
  const storeNFT = async (image) => {
    // load the file from disk
    // const image = await e.target;

    // create a new NFTStorage client using our API key
    const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY })

    // call client.store, passing in the image & metadata
    return nftstorage.storeBlob(image);
  };
  
  
  function getAccessToken () {
    // If you're just testing, you can paste in a token
    // and uncomment the following line:
    // return 'paste-your-token-here'

    // In a real app, it's better to read an access token from an
    // environement variable or other configuration that's kept outside of
    // your code base. For this to work, you need to set the
    // WEB3STORAGE_TOKEN environment variable before you run your code.
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGQyOTgxOWQ0YTlDNUM4ZDM4ZjVFRUMzYTU3MzBFRUFDODAxNDVCYjMiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjgxNzEzMjYxNjMsIm5hbWUiOiJVTkNIQUlOLUVUSC1ORlQifQ.bsKIs0ZZ9SUE_De32fnU_3CmKh_qyMGAtSi6Ye2gZeA";
  };
  
  function makeStorageClient () {
    return new Web3Storage({ token: getAccessToken() })
  };

  async function checkStatus (cid) {
    const client = makeStorageClient()
    const status = await client.status(cid)
    console.log(status)
    if (status) {
      // your code to do something fun with the status info here
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

  const API_KEY = 
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGQyOTgxOWQ0YTlDNUM4ZDM4ZjVFRUMzYTU3MzBFRUFDODAxNDVCYjMiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjgxNzEzMjYxNjMsIm5hbWUiOiJVTkNIQUlOLUVUSC1ORlQifQ.bsKIs0ZZ9SUE_De32fnU_3CmKh_qyMGAtSi6Ye2gZeA";
    // const client = new Web3Storage({ token: API_KEY })
  
  const imageToNFT = async (e) => {
    const images = e.target.files;

    // const imageFiles = image.files;

    for (const image of images) {
      const cid = await storeNFT(image);
      console.log(cid);
      askContractToMintNft(cid);
    }
   
    // const rootCid = await client.put(image.files, {
    //   name: 'experiment',
    //   maxRetries: 3
    // })

    // checkStatus(rootCid);
    // const res = await client.get(rootCid) // Web3Response
    // const files = await res.files() // Web3File[]
    // for (const file of files) {
    //   console.log("file.cid:",file.cid)
    //   askContractToMintNft(file.cid)
    // }
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