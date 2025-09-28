//create script to seed categories

import { db } from "@/db"
import { categories } from "@/db/schema"

const categoryNames = [
    "Cars and Vehicles",
    "Comedy",
    "Education",
    "Entertainment",
    "Film and Animation",
    "Gaming",
    "Howto and Style",
    "Music",
    "News and Politics",
    "Nonprofits and Activism",
    "People and Blogs",
    "Pets and Animals",
    "Science and Technology",
    "Sports",
    "Travel and Events",
]

async function main(){
    try{
        const values = categoryNames.map((name) => ({
            name,
            description: `Videos related to ${name.toLowerCase()}`,

        }))
        await db.insert(categories).values(values);
    }catch(err){
        console.error("error seeding categories", err)
        process.exit(1)
    }
}

main()


//With bun you can use scripts with imports