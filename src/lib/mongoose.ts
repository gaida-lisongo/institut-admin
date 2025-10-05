import mongoose from "mongoose";

// Déclaration de type pour l'objet global
declare global {
    var mongoose: {
        promise: Promise<typeof import("mongoose")> | null;
        conn: typeof import("mongoose") | null;
    };
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error("Please provide a MongoDB URI in the environment variables");
}

// Type assertion after runtime check
const mongoUri: string = MONGODB_URI;

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { promise: null, conn: null };
}

export async function connectToDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(mongoUri);
    }

    cached.conn = await cached.promise;
    return cached.conn;
}