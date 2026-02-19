const svg =
d3.select("svg")

const width =
+svg.attr("width")

const height =
+svg.attr("height")


export async function loadGraph(){

const address =
document.getElementById("address").value

if(!address){

alert("Enter wallet address")
return

}

svg.selectAll("*").remove()


const res =
await fetch(`/api/trac-txstory/${address}`)

const data =
await res.json()


if(!data.nodes.length){

alert("No transactions found")
return

}


render(data)

}



function render(data){

const nodes =
data.nodes

const links =
data.links


const sizeScale =
d3.scaleLinear()
.domain([1,d3.max(nodes,d=>d.size)])
.range([8,30])



const simulation =
d3.forceSimulation(nodes)

.force("link",
d3.forceLink(links)
.id(d=>d.id)
.distance(120)
)

.force("charge",
d3.forceManyBody()
.strength(-350)
)

.force("center",
d3.forceCenter(width/2,height/2)
)

.force("collision",
d3.forceCollide()
.radius(d=>sizeScale(d.size)+4)
)



const link =
svg.append("g")
.selectAll("line")
.data(links)
.enter()
.append("line")
.attr("stroke","#00ccff")
.attr("stroke-opacity",0.3)



const node =
svg.append("g")
.selectAll("circle")
.data(nodes)
.enter()
.append("circle")

.attr("r",d=>sizeScale(d.size))

.attr("fill",
d=>d.main
? "#00ff88"
: "#00ccff"
)

.attr("stroke","#ffffff22")

.attr("stroke-width",1.5)

.call(

d3.drag()

.on("start",dragStart)
.on("drag",drag)
.on("end",dragEnd)

)



const label =
svg.append("g")
.selectAll("text")
.data(nodes)
.enter()
.append("text")

.text(d=>d.main?"YOU":d.id.slice(0,6))

.attr("fill","#aaa")
.attr("font-size","11px")



node.append("title")
.text(d=>d.id)



simulation.on("tick",()=>{

link

.attr("x1",d=>d.source.x)
.attr("y1",d=>d.source.y)
.attr("x2",d=>d.target.x)
.attr("y2",d=>d.target.y)


node

.attr("cx",d=>d.x)
.attr("cy",d=>d.y)


label

.attr("x",d=>d.x+10)
.attr("y",d=>d.y+4)

})

}



function dragStart(e,d){

if(!e.active)
simulation.alphaTarget(0.3).restart()

d.fx=d.x
d.fy=d.y

}


function drag(e,d){

d.fx=e.x
d.fy=e.y

}


function dragEnd(e,d){

if(!e.active)
simulation.alphaTarget(0)

d.fx=null
d.fy=null

}
