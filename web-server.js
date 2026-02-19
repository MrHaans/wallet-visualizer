import express from "express"
import fetch from "node-fetch"
import { analyzeWallet } from "./features/ai-agent/index.js"

const app = express()

const API_KEY = "ZEZAY6HGE4VZJVNI55184QCDSE3RJ16ETD"

app.use(express.static("public"))


/* =========================================
   GRAPH ENDPOINT (EXISTING)
========================================= */

app.get("/api/trac-txstory/:address", async (req,res)=>{

try{

const address = req.params.address

console.log("Fetching real tx for:", address)

const url =
`https://api.etherscan.io/v2/api?chainid=1&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${API_KEY}`

const response = await fetch(url)
const data = await response.json()

if(data.status !== "1"){
return res.json({
nodes:[],
links:[]
})
}

const txs = data.result.slice(0,50)

const nodeMap = {}
const links = []

txs.forEach(tx=>{

const from = tx.from.toLowerCase()
const to = tx.to.toLowerCase()

if(!nodeMap[from])
nodeMap[from] = {
id:from,
size:0,
main: from===address.toLowerCase()
}

if(!nodeMap[to])
nodeMap[to] = {
id:to,
size:0,
main: to===address.toLowerCase()
}

nodeMap[from].size += 1
nodeMap[to].size += 1

links.push({
source:from,
target:to
})

})

const nodes = Object.values(nodeMap)

res.json({
nodes,
links
})

}
catch(e){

console.log(e)

res.json({
nodes:[],
links:[]
})

}

})


/* =========================================
   AI AGENT ENDPOINT (NEW)
========================================= */

app.get("/api/ai-analysis/:address/:mode", async (req,res)=>{

try{

const address = req.params.address
const mode = req.params.mode

console.log("AI analyzing:", address, "Mode:", mode)

const url =
`https://api.etherscan.io/v2/api?chainid=1&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${API_KEY}`

const response = await fetch(url)
const data = await response.json()

if(data.status !== "1"){
return res.json({ result: "No transactions found." })
}

const txs = data.result.slice(0,50)

const result = analyzeWallet(txs, address, mode)

res.json({ result })

}
catch(e){

console.log(e)

res.json({ result: "Error analyzing wallet." })

}

})


/* =========================================
   SERVER START
========================================= */

app.listen(3000,()=>{

console.log("Server running:")
console.log("http://localhost:3000")

})
