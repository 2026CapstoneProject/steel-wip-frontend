import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Web_AppLayout from "../../../components/common/Web_AppLayout/Web_AppLayout";
import { getScenarioCart, getScenarioSendHistory } from "../../../services/scenarioService";
import { wipService } from "../../../services/wipService";

const formatDate = (value) => {
  if (!value) return "-";
  return String(value).slice(0, 10);
};

const formatMinutes = (value) => {
  const minutes = Number(value) || 0;
  const hours = Math.floor(minutes / 60);
  const remain = minutes % 60;
  if (hours === 0) return `${remain}분`;
  if (remain === 0) return `${hours}시간`;
  return `${hours}시간 ${remain}분`;
};

const sumScenarioMinutes = (scenarios = []) =>
  scenarios.reduce((sum, item) => sum + (Number(item.totalMinute) || 0), 0);

const sumSentInputWips = (projects = []) =>
  projects.reduce(
    (sum, project) =>
      sum +
      (project.scenarios ?? []).reduce(
        (inner, scenario) => inner + (Number(scenario.numInputWip) || 0),
        0
      ),
    0
  );

function ScenarioListCard({ title, rows, emptyText, onClickRow }) {
  return (
    <section className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <span className="h-5 w-1 rounded-full bg-primary" />
        <h3 className="font-headline text-lg font-bold text-on-surface">{title}</h3>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-outline-variant/20 bg-surface px-5 py-10 text-center text-sm text-on-surface-variant">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => onClickRow(row)}
              className="flex w-full items-start justify-between rounded-xl bg-surface p-4 text-left transition hover:bg-surface-container-low"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {row.badge}
                </p>
                <h4 className="mt-1 text-sm font-bold text-on-surface">{row.title}</h4>
                <p className="mt-1 text-xs text-on-surface-variant">{row.subtitle}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-on-surface-variant">{row.metaLabel}</p>
                <p className="mt-1 text-sm font-bold text-on-surface">{row.metaValue}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const [draftProjects, setDraftProjects] = useState([]);
  const [sentProjects, setSentProjects] = useState([]);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const [draftResponse, sentResponse, wipResponse] = await Promise.all([
          getScenarioCart(),
          getScenarioSendHistory(),
          wipService.getAll(),
        ]);

        setDraftProjects(draftResponse.data?.data ?? []);
        setSentProjects(sentResponse.data?.data ?? []);
        setInventoryCount((wipResponse.data?.data ?? []).length);
      } catch (err) {
        console.error("대시보드 조회 실패:", err);
        setError("대시보드 데이터를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const metricCards = useMemo(() => {
    const draftScenarioCount = draftProjects.reduce(
      (sum, project) => sum + (project.scenario?.length ?? 0),
      0
    );
    const sentScenarioCount = sentProjects.reduce(
      (sum, project) => sum + (project.scenarios?.length ?? 0),
      0
    );

    return [
      {
        label: "미발행 시나리오",
        value: String(draftScenarioCount),
        sub: `예상 총 소요 시간 ${formatMinutes(sumScenarioMinutes(draftProjects.flatMap((p) => p.scenario ?? [])))}`,
      },
      {
        label: "발행된 시나리오",
        value: String(sentScenarioCount),
        sub: `투입 자재 합계 ${sumSentInputWips(sentProjects)} EA`,
      },
      {
        label: "재고 잔재 수",
        value: String(inventoryCount),
        sub: "현재 DB 기준 전체 재고",
      },
    ];
  }, [draftProjects, sentProjects, inventoryCount]);

  const draftRows = useMemo(() => {
    return draftProjects
      .flatMap((project) =>
        (project.scenario ?? []).map((scenario) => ({
          id: scenario.id,
          badge: "Draft",
          title: scenario.title,
          subtitle: `${project.projectTitle} · 납기 ${formatDate(scenario.due)}`,
          metaLabel: "예상 시간",
          metaValue: formatMinutes(scenario.totalMinute),
        }))
      )
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);
  }, [draftProjects]);

  const sentRows = useMemo(() => {
    return sentProjects
      .flatMap((project) =>
        (project.scenarios ?? []).map((scenario) => ({
          id: scenario.scenarioId,
          badge: "Released",
          title: scenario.scenarioTitle,
          subtitle: `${project.projectTitle} · 전송일 ${formatDate(scenario.orderedAt)}`,
          metaLabel: "투입 자재",
          metaValue: `${scenario.numInputWip ?? 0} EA`,
        }))
      )
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);
  }, [sentProjects]);

  const handleOpenDraft = (row) => {
    navigate("/office/scenario/creationhistory/detail", {
      state: { scenarioId: row.id },
    });
  };

  const handleOpenSent = (row) => {
    navigate("/office/scenario/releasehistory/detail", {
      state: { scenarioId: row.id },
    });
  };

  return (
    <Web_AppLayout pageTitle="대시보드">
      <div className="px-8 pt-8 pb-12">
        {loading && (
          <div className="py-24 text-center text-sm text-on-surface-variant">
            대시보드 데이터를 불러오는 중...
          </div>
        )}

        {error && !loading && (
          <div className="py-12 text-center text-sm text-red-500">{error}</div>
        )}

        {!loading && !error && (
          <div className="space-y-8">
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {metricCards.map((card) => (
                <article
                  key={card.label}
                  className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm"
                >
                  <p className="text-sm font-semibold text-on-surface-variant">{card.label}</p>
                  <p className="mt-3 font-headline text-4xl font-extrabold text-primary">
                    {card.value}
                  </p>
                  <p className="mt-3 text-sm text-on-surface-variant">{card.sub}</p>
                </article>
              ))}
            </section>

            <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <ScenarioListCard
                title="최근 생성 시나리오"
                rows={draftRows}
                emptyText="생성된 미발행 시나리오가 없습니다."
                onClickRow={handleOpenDraft}
              />
              <ScenarioListCard
                title="최근 발행 시나리오"
                rows={sentRows}
                emptyText="발행된 시나리오가 없습니다."
                onClickRow={handleOpenSent}
              />
            </section>
          </div>
        )}
      </div>
    </Web_AppLayout>
  );
}
