import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
        if (!mongoUri) {
            console.error('MongoDB Connection error: MONGODB_URI is missing from environment variables');
            process.exit(1);
        }
        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB is connected`);
    } catch (error) {
        console.error(`Connection error : ${error}`);
        process.exit(1);
    }
}

export default connectDB;