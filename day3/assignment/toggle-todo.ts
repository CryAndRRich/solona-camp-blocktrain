import { web3 } from "@coral-xyz/anchor"
import { getTodoPda } from "../pda/get-todo-pda"
import { getProfilePda } from "../pda/get-profile-pda"
import { TodoApp } from "../idl/todo_app"
import { Program } from "@coral-xyz/anchor"

type ToggleTodoParams = {
  program: Program<TodoApp>
  todoIndex: number
  wallet: web3.PublicKey
}

export async function toggleTodo({
  program,
  todoIndex,
  wallet,
}: ToggleTodoParams) {
  const profilePda = getProfilePda(wallet)
  const todoPda = getTodoPda(profilePda[0], todoIndex)

  await program.methods
    .toggleTodo()
    .accounts({
      todo: todoPda[0],
      profile: profilePda[0],
      authority: wallet,
    })
    .rpc()
}
