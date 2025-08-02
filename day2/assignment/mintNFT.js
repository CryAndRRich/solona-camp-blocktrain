import { 
    Connection, 
    Keypair 
} from "@solana/web3.js";
import {
  createUmi, 
  generateSigner, 
  keypairIdentity, 
  percentAmount
} from "@metaplex-foundation/umi";
import {
  createNft, 
  mplTokenMetadata
} from "@metaplex-foundation/mpl-token-metadata";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { fromWeb3JsKeypair } from "@metaplex-foundation/umi-web3js-adapters";

const connection = new Connection("https://api.devnet.solana.com", "confirmed");
const payer = Keypair.generate();

(async () => {
    await connection.requestAirdrop(payer.publicKey, 2e9);

    const umi = createUmi(connection)
        .use(keypairIdentity(fromWeb3JsKeypair(payer)))
        .use(mplTokenMetadata())
        .use(irysUploader());

    const metadata = {
        name: "Solana Bootcamp NFT",
        symbol: "SBNFT",
        description: "NFT from Solana Bootcamp Autumn 2024",
        image: "https://raw.githubusercontent.com/trankhacvy/solana-bootcamp-autumn-2024/main/assets/logo.png",
        attributes: [
        { trait_type: "Level", value: "Advanced" },
        { trait_type: "Program", value: "Bootcamp" }
        ]
    };

    const uri = await umi.uploader.uploadJson(metadata);
    console.log("🖼️ Metadata URI:", uri);

    const mint = generateSigner(umi);
    const result = await createNft(umi, {
        mint,
        name: metadata.name,
        symbol: metadata.symbol,
        uri: uri,
        sellerFeeBasisPoints: percentAmount(10),
    }).sendAndConfirm(umi);

    const sig = Buffer.from(result.signature).toString("base64");
    console.log("✅ NFT TX Signature:", sig);
})();
