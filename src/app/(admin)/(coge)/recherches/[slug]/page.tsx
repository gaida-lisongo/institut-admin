
import UnderDevelopment from "@/components/common/UnderDevelopment";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function UnderDevelopmentPage() {
    return (
        <div>
            <PageBreadcrumb pageTitle="En développement" />
            <UnderDevelopment 
                title="Fonctionnalité en développement"
                description="Cette fonctionnalité est actuellement en cours de développement. Notre équipe travaille activement pour vous offrir la meilleure expérience possible."
                estimatedDate="Décembre 2024"
                showBackButton={true}
                showHomeButton={true}
            />
        </div>
    );
}