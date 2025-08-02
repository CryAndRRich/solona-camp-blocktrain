import {
    Connection, Keypair, PublicKey, SystemProgram, Transaction,
    sendAndConfirmTransaction,
} from "@solana/web3.js";
import {
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    MINT_SIZE,
    getAssociatedTokenAddressSync,
    createAssociatedTokenAccountInstruction,
    createInitializeMintInstruction,
    createMintToCheckedInstruction,
} from "@solana/spl-token";
import bs58 from "bs58";
import fs from "fs";
  
// 👇 Replace this with your real secret key base58 if you want
const payer = Keypair.generate();
const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  
const recipient = new PublicKey("63EEC9FfGyksm7PkVC6z8uAmqozbQcTzbkWJNsgqjkFs");
  
(async () => {
    await connection.requestAirdrop(payer.publicKey, 2e9);
  
    const mintKeypair = Keypair.generate();
    const decimals = 6;
    const lamports = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
  
    const ataPayer = getAssociatedTokenAddressSync(mintKeypair.publicKey, payer.publicKey, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
    const ataRecipient = getAssociatedTokenAddressSync(mintKeypair.publicKey, recipient, false, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID);
  
    const tx = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: payer.publicKey,
            newAccountPubkey: mintKeypair.publicKey,
            space: MINT_SIZE,
            lamports,
            programId: TOKEN_2022_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
            mintKeypair.publicKey,
            decimals,
            payer.publicKey,
            payer.publicKey,
            TOKEN_2022_PROGRAM_ID
        ),
        createAssociatedTokenAccountInstruction(
            payer.publicKey,
            ataPayer,
            payer.publicKey,
            mintKeypair.publicKey,
            TOKEN_2022_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        ),
        createAssociatedTokenAccountInstruction(
            payer.publicKey,
            ataRecipient,
            recipient,
            mintKeypair.publicKey,
            TOKEN_2022_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
        ),
        createMintToCheckedInstruction(
            mintKeypair.publicKey,
            ataPayer,
            payer.publicKey,
            100_000_000,
            decimals,
            [],
            TOKEN_2022_PROGRAM_ID
        ),
        createMintToCheckedInstruction(
            mintKeypair.publicKey,
            ataRecipient,
            payer.publicKey,
            10_000_000,
            decimals,
            [],
            TOKEN_2022_PROGRAM_ID
        )
    );
  
    const sig = await sendAndConfirmTransaction(connection, tx, [payer, mintKeypair]);
    console.log("✅ Fungible Token TX Signature:", sig);
  
    fs.writeFileSync("ft-mint.txt", mintKeypair.publicKey.toBase58());
})();
  