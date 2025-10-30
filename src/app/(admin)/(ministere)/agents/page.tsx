import AgentsTable from "@/components/agents/AgentsTable";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function AgentsPage() {
    return <div>
        <PageBreadcrumb pageTitle="Agents" />
        <AgentsTable />
    </div>;
}