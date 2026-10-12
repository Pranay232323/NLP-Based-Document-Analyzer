import Link from "next/link";
import { Card, CardBody, CardHeader, SectionHeading, Badge, PrimaryButton } from "@/components/ui/primitives";
import { EXPERIMENT_REGISTRY } from "@/lib/nlp/experimentRegistry";

export default function ExperimentsPage() {
  const coreExperiments = EXPERIMENT_REGISTRY.filter((e) => e.category === "Core Syllabus Practical");
  const advancedExperiments = EXPERIMENT_REGISTRY.filter((e) => e.category === "Advanced NLP Lab");

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Academic Curriculum"
        title="Comprehensive NLP Experiment Registry & Syllabus Mapping"
        description="Structured catalog mapping both prescribed undergraduate laboratory practicals (Exp 1-10) and advanced engineering laboratory expansions (Exp 11-16) to demonstrable interactive modules."
      />

      {/* CORE EXPERIMENTS TABLE */}
      <Card>
        <CardHeader
          title="Part I: Prescribed Core Syllabus Practicals"
          subtitle="10 Foundational Natural Language Processing laboratory experiments"
          action={<Badge tone="indigo">Core Practicals</Badge>}
        />
        <CardBody className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-3 pr-4">#</th>
                <th className="py-3 pr-4">Topic / Syllabus Aim</th>
                <th className="py-3 pr-4">Algorithm & Engine</th>
                <th className="py-3 pr-4">Application Module</th>
                <th className="py-3 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {coreExperiments.map((m) => (
                <tr key={m.id} className="border-b border-slate-100">
                  <td className="py-3 pr-4">
                    <Badge tone="indigo">Exp {m.expNumber}</Badge>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="font-semibold text-slate-800">{m.title}</p>
                    <p className="text-xs text-slate-500">{m.aim}</p>
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-600 max-w-xs">{m.algorithm}</td>
                  <td className="py-3 pr-4 text-xs font-medium text-slate-700">{m.moduleName}</td>
                  <td className="py-3 pr-4 text-right">
                    <Link href={m.route}>
                      <PrimaryButton className="px-3 py-1.5 text-xs">Open Module</PrimaryButton>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* ADVANCED EXPERIMENTS TABLE */}
      <Card>
        <CardHeader
          title="Part II: Advanced NLP Laboratory Expansions"
          subtitle="6 Advanced computational linguistics and machine learning experiments"
          action={<Badge tone="violet">Advanced Lab</Badge>}
        />
        <CardBody className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-3 pr-4">#</th>
                <th className="py-3 pr-4">Topic / Syllabus Aim</th>
                <th className="py-3 pr-4">Algorithm & Engine</th>
                <th className="py-3 pr-4">Application Module</th>
                <th className="py-3 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {advancedExperiments.map((m) => (
                <tr key={m.id} className="border-b border-slate-100">
                  <td className="py-3 pr-4">
                    <Badge tone="violet">Exp {m.expNumber}</Badge>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="font-semibold text-slate-800">{m.title}</p>
                    <p className="text-xs text-slate-500">{m.aim}</p>
                  </td>
                  <td className="py-3 pr-4 text-xs text-slate-600 max-w-xs">{m.algorithm}</td>
                  <td className="py-3 pr-4 text-xs font-medium text-slate-700">{m.moduleName}</td>
                  <td className="py-3 pr-4 text-right">
                    <Link href={m.route}>
                      <PrimaryButton className="px-3 py-1.5 text-xs">Open Module</PrimaryButton>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
