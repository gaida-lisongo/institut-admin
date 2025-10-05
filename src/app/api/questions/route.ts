import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import Question from "@/models/Question";

export async function GET() {
    try {
        await connectToDB();
        const questions = await Question.find();
        return NextResponse.json(questions);
    } catch (error) {
        console.error("Error fetching questions:", error);
        return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectToDB();
        const { enonce, reponse, choix, pts } = await request.json();
        const question = await Question.create({ enonce, reponse, choix, pts });
        return NextResponse.json(question);
    } catch (error) {
        console.error("Error creating question:", error);
        return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await connectToDB();
        const { id, enonce, reponse, choix, pts } = await request.json();
        const question = await Question.findByIdAndUpdate(id, { enonce, reponse, choix, pts });
        return NextResponse.json(question);
    } catch (error) {
        console.error("Error updating question:", error);
        return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await connectToDB();
        const { id } = await request.json();
        const question = await Question.findByIdAndDelete(id);
        return NextResponse.json(question);
    } catch (error) {
        console.error("Error deleting question:", error);
        return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
    }
}
