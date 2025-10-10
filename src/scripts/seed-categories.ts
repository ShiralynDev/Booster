//create script to seed categories

import { db } from "@/db"
import { assets } from "@/db/schema"



const assetsName = [
    {
        price:100,
        name: "Founder",
        description: "A Founder badge for the first users in the platform",
    }
]

async function main(){
    // try{
    //     const values = categoryNames.map((name) => ({
    //         name,
    //         description: `Videos related to ${name.toLowerCase()}`,

    //     }))
    //     await db.insert(categories).values(values);
    // }catch(err){
    //     console.error("error seeding categories", err)
    //     process.exit(1)
    // }

    try{
        const values = assetsName.map((asset) => ({
            ...asset,
        }))
        await db.insert(assets).values(values);
    }catch(err){
        console.error("error seeding categories", err)
        process.exit(1)
    }





   
}

main()


//With bun you can use scripts with imports
//EXEcute bun src/script/thisfile.ts from the root directory of the project