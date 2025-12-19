const fs=require('fs');const data=JSON.parse(fs.readFileSync('./foundationFoods.json','utf-8'));console.log(Object.keys(data));
