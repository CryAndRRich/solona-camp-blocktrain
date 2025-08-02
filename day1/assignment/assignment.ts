import {
    Keypair,
    PublicKey,
    LAMPORTS_PER_SOL,
    SystemProgram,
    TransactionMessage,
    VersionedTransaction,
} from "@solana/web3.js";

import { 
    payer, 
    connection } from "@/lib/vars";

import { 
    explorerURL, 
    printConsoleSeparator 
} from "@/lib/helpers";

(async () => {
    console.log("Payer:", payer.publicKey.toBase58());

    // Destination address
    const destination = new PublicKey("63EEC9FfGyksm7PkVC6z8uAmqozbQcTzbkWJNsgqjkFs");

    // Generate a new account (temporary wallet)
    const tempAccount = Keypair.generate();
    console.log("Temporary account:", tempAccount.publicKey.toBase58());

    // Amounts
    const space = 0;
    const rentExemptionLamports = await connection.getMinimumBalanceForRentExemption(space);
    const transferLamports = 0.1 * LAMPORTS_PER_SOL;
    const totalFunding = rentExemptionLamports + transferLamports;

    // Create the temp account (payer funds it)
    const createAccountIx = SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: tempAccount.publicKey,
        lamports: totalFunding,
        space,
        programId: SystemProgram.programId,
    });

    // Transfer 0.1 SOL from temp account to destination
    const transferIx = SystemProgram.transfer({
        fromPubkey: tempAccount.publicKey,
        toPubkey: destination,
        lamports: transferLamports,
    });

    // Close temp account and return remaining lamports to payer
    const closeAccountIx = SystemProgram.assign({
        accountPubkey: tempAccount.publicKey,
        programId: SystemProgram.programId,
    });

    const withdrawRemainingLamportsIx = SystemProgram.transfer({
        fromPubkey: tempAccount.publicKey,
        toPubkey: payer.publicKey,
        lamports: rentExemptionLamports, // reclaim rent
    });

    // Get recent blockhash
    const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext();

    // Build message
    const message = new TransactionMessage({
        payerKey: payer.publicKey,
        recentBlockhash: blockhash,
        instructions: [
        createAccountIx,
        transferIx,
        withdrawRemainingLamportsIx, // manually reclaim lamports
        ],
    }).compileToV0Message();

    // Build transaction
    const tx = new VersionedTransaction(message);
    tx.sign([payer, tempAccount]);

    // Send transaction
    const signature = await connection.sendTransaction(tx, {
        minContextSlot,
    });

    await connection.confirmTransaction({ 
        blockhash, 
        lastValidBlockHeight, 
        signature });

    printConsoleSeparator();
    console.log("Transaction completed.");
    console.log(explorerURL({ txSignature: signature }));
})();
