import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from './utils/WavePortal.json';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [message, setMessage] = useState("");
  const contractAddress = "0x97C9893082EDeA1B8FB889E659E478C46F05496d";
  const contractABI = abi.abi;

  /*
   * Create a method that gets all waves from your contract
   */
  const getAllWaves = async () => {
    try {
      // const { ethereum } = window;
      
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
         /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await wavePortalContract.getAllWaves();


        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
////



        
        wavePortalContract.on("NewWave", (from, timestamp, message) => {
          console.log("NewWave", from, timestamp, message);

          setAllWaves(prevState => [...prevState, {
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message
          }]);
        });
  
  
        
  
  
  
          ////
        } else {
          console.log("Ethereum object doesn't exist!")
        }
      } catch (error) {
        console.log(error);
      }
    }


  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        //just added
        getAllWaves();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
    } catch (error) {
      console.log(error)
    }
  }

  function tweet(event){
    setMessage(event.target.value)
    console.log("Tweet: ", event.target.value)
  }
  

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        //difference
        const waveTxn = await wavePortalContract.wave(message, { gasLimit: 300000 });
        //above
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
  
  return (
    <div className="mainContainer">
      <div className="dataContainer">

                <img src="who-needs-blockchain-web3-min-removebg-preview.png" alt="Nice"
          height = "100"  width = "200" className = "center"
        />
        <div className="header">
          Web3.0 Twitter
        </div>

        <div className="bio">
           Welcome to the future of decentralized social media. Have your thoughts and unpopular opinions uploaded to the blockchain for everyone to see...
        </div>

            <br></br>

        <textarea value={message} className="message" onChange={tweet} placeholder= "What's on your mind?">
        </textarea>

        <button className="waveButton" onClick={wave}>
          Post!
        </button>

        {!currentAccount && ( 
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
       )}

        <br></br>

        <div className="comment">
          Take a look at all the other messages!
        </div>

        <br></br>

  <br></br>

        {allWaves.map((wave, index) => {
          return (
            <div className="userInputs">
              <div class="allText">Address: {wave.address}</div>
              <br></br>
              <div class="allText">Time: {wave.timestamp.toString()}</div>
              <br></br>
              <div class="allText">Message: {wave.message}</div>
              <br></br>
              
            </div>)
        })}
      </div>
    </div>
  );
}

export default App

