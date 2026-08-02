import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI as string);
        console.log(`Mogno is connected`)
    } catch (error) {
        console.error(`Connection error : ${error}`);
        process.exit(1);
    }
}

export default connectDB;