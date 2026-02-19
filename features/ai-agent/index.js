export function analyzeWallet(txs, address, mode) {

  const lowerAddress = address.toLowerCase()

  let incoming = 0
  let outgoing = 0
  let uniqueSet = new Set()
  let selfTransfer = false
  let blockCounter = {}

  txs.forEach(tx => {
    const from = tx.from.toLowerCase()
    const to = tx.to.toLowerCase()

    if (from === lowerAddress) outgoing++
    if (to === lowerAddress) incoming++

    if (from === lowerAddress) uniqueSet.add(to)
    if (to === lowerAddress) uniqueSet.add(from)

    if (from === to) selfTransfer = true

    const block = tx.blockNumber
    blockCounter[block] = (blockCounter[block] || 0) + 1
  })

  const total = txs.length
  const uniqueAddresses = uniqueSet.size
  const outgoingRatio = total ? outgoing / total : 0
  const incomingRatio = total ? incoming / total : 0
  const maxTxInBlock = Math.max(...Object.values(blockCounter))

  // ===== MODE HANDLER =====

  if (mode === "1") {
    if (outgoingRatio > 0.7)
      return "This wallet is primarily distributing assets (mostly outgoing transactions)."

    if (incomingRatio > 0.7)
      return "This wallet is primarily accumulating assets."

    if (uniqueAddresses > 20)
      return "This wallet interacts with many unique addresses. Likely an active trader."

    return "This wallet shows balanced activity."
  }

  if (mode === "2") {
    let score = 0

    if (outgoingRatio > 0.8) score += 30
    if (maxTxInBlock > 5) score += 25
    if (uniqueAddresses > 25) score += 20
    if (selfTransfer) score += 10

    if (score > 100) score = 100

    let level = "Low"
    if (score > 60) level = "High"
    else if (score > 30) level = "Medium"

    return `Risk Score: ${score}/100\nLevel: ${level}`
  }

  if (mode === "3") {
    if (maxTxInBlock > 5 && total > 20)
      return "High probability of bot-like behavior."

    return "No strong bot pattern detected."
  }

  if (mode === "4") {
    return `
Total Transactions: ${total}
Incoming: ${incoming}
Outgoing: ${outgoing}
Unique Addresses: ${uniqueAddresses}
`
  }

  if (mode === "5") {
    if (selfTransfer)
      return "Self-transfer activity detected."

    if (outgoingRatio > 0.9)
      return "Heavy outgoing pattern detected. Possible draining behavior."

    return "No major suspicious pattern detected."
  }

  return "Invalid mode."
}
