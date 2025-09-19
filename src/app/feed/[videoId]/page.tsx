interface PageProps {
    params: Promise<{ videoId: string }>; //returns a promise with type videoId which is a string
}

//REMEMBER: await dynamic params

const Page = async ({params}: PageProps) => {

    const {videoId} = await params;

    return ( 
        <div>
            Video Id Page {videoId}
        </div>
     );
}
 
export default Page;