import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoose";
import Classe from "@/models/Classe";

export async function GET() {
    try {
        await connectToDB();
        const classes = await Classe.find();
        return NextResponse.json(classes);
    } catch (error) {
        console.error("Error fetching classes:", error);
        return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectToDB();
        const { nom, niveau } = await request.json();
        const classe = await Classe.create({ nom, niveau });
        return NextResponse.json(classe);
    } catch (error) {
        console.error("Error creating class:", error);
        return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await connectToDB();
        const { id, nom, niveau } = await request.json();
        const classe = await Classe.findByIdAndUpdate(id, { nom, niveau });
        return NextResponse.json(classe);
    } catch (error) {
        console.error("Error updating class:", error);
        return NextResponse.json({ error: "Failed to update class" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await connectToDB();
        const { id } = await request.json();
        const classe = await Classe.findByIdAndDelete(id);
        return NextResponse.json(classe);
    } catch (error) {
        console.error("Error deleting class:", error);
        return NextResponse.json({ error: "Failed to delete class" }, { status: 500 });
    }
}
