let fits = JSON.parse(localStorage.getItem("fits")) || []

const fitsContainer = document.getElementById("fits")
const categoriesContainer = document.getElementById("categories")
const searchInput = document.getElementById("search")

/* normalize old / broken saved data */
fits = fits.map(f => ({
name: f.name || "Unnamed Fit",
category: f.category || "Unsorted",
tags: Array.isArray(f.tags) ? f.tags : [],
cmd: f.cmd || ""
}))

function saveFits(){
localStorage.setItem("fits", JSON.stringify(fits))
}

function addFit(){

const name = document.getElementById("name").value.trim()
const category = document.getElementById("category").value.trim() || "Unsorted"
const tags = document.getElementById("tags").value
.split(",")
.map(t=>t.trim())
.filter(Boolean)

const cmd = document.getElementById("cmd").value.trim()

const fit = { name, category, tags, cmd }

fits.push(fit)

saveFits()
render()

document.getElementById("name").value=""
document.getElementById("category").value=""
document.getElementById("tags").value=""
document.getElementById("cmd").value=""
}

function copyCommand(cmd){
navigator.clipboard.writeText(cmd)
}

function render(){

const search = (searchInput.value || "").toLowerCase()

fitsContainer.innerHTML=""

const filtered = fits.filter(f =>
(f.name || "").toLowerCase().includes(search) ||
(f.tags || []).join(" ").toLowerCase().includes(search)
)

filtered.forEach(f=>{

const tagsHTML = (f.tags || [])
.map(t=>`<span>${t}</span>`)
.join("")

const card = document.createElement("div")
card.className="card"

card.innerHTML = `
<h3>${f.name}</h3>
<div class="meta">${f.category}</div>
<div class="tags">${tagsHTML}</div>
<code>${f.cmd}</code>
<button>Copy</button>
`

card.querySelector("button").onclick = () => copyCommand(f.cmd)

fitsContainer.appendChild(card)

})

renderCategories()
}

function renderCategories(){

let categories = {}

fits.forEach(f=>{
if(!categories[f.category]) categories[f.category]=[]
categories[f.category].push(f)
})

categoriesContainer.innerHTML=""

for(const cat in categories){

const block=document.createElement("div")
block.className="category"

block.innerHTML=`<div class="category-title">${cat}</div>`

categories[cat].forEach(f=>{

const item=document.createElement("div")
item.className="category-item"
item.textContent=f.name

item.onclick=()=>{
searchInput.value=f.name
render()
}

block.appendChild(item)

})

categoriesContainer.appendChild(block)

}

}

document.getElementById("saveBtn").onclick = addFit
searchInput.addEventListener("input", render)

render()