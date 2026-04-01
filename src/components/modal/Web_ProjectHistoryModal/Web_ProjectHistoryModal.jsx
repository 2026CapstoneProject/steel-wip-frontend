import { useMemo, useState } from "react";

const mockProjects = [
  {
    id: 1,
    projectName: "토네이도",
    projectDueDate: "2026-04-30",
    productionPlanName: "토네이도-1",
  },
  {
    id: 2,
    projectName: "토네이도",
    projectDueDate: "2026-05-15",
    productionPlanName: "토네이도-2",
  },
  {
    id: 3,
    projectName: "블리자드",
    projectDueDate: "2026-06-10",
    productionPlanName: "블리자드-1",
  },
];

export default function Web_ProjectHistoryModal({ onClose, onSelectProject }) {
  const [keyword, setKeyword] = useState("");

  const filteredProjects = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase();

    if (!trimmed) return mockProjects;

    return mockProjects.filter((project) =>
      project.projectName.toLowerCase().includes(trimmed),
    );
  }, [keyword]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-[1px]">
      <div className="w-full max-w-2xl bg-surface-container-lowest rounded-modal shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col">
        <div className="px-8 py-6 flex items-center justify-between border-b border-surface-container">
          <h2 className="text-xl font-bold text-on-surface tracking-tight font-headline">
            프로젝트 이력 조회
          </h2>
          <button
            type="button"
            className="text-on-surface-variant hover:text-on-surface transition-colors"
            onClick={onClose}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-8">
          <div className="flex gap-3 mb-8">
            <div className="relative flex-1 group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
                search
              </span>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="프로젝트 명을 입력하세요"
                className="w-full pl-12 pr-4 py-3 bg-surface-container-low border-0 rounded text-on-surface placeholder:text-on-surface-variant/60 font-body transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <button
              type="button"
              className="px-6 py-3 bg-primary hover:bg-primary-dim text-white font-semibold rounded shadow-sm flex items-center gap-2 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">search</span>
              검색
            </button>
          </div>

          <div className="overflow-hidden">
            <table className="w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-on-surface-variant text-xs font-bold uppercase tracking-wider font-label">
                  <th className="px-4 py-2 text-left">프로젝트 명</th>
                  <th className="px-4 py-2 text-left">납기일</th>
                  <th className="px-4 py-2 text-right">실행</th>
                </tr>
              </thead>
              <tbody className="font-body text-sm">
                {filteredProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="bg-surface-container-low/50 hover:bg-surface-container-low transition-colors group"
                  >
                    <td className="px-4 py-4 rounded-l font-bold text-on-surface">
                      {project.projectName}
                    </td>
                    <td className="px-4 py-4">{project.projectDueDate}</td>
                    <td className="px-4 py-4 text-right rounded-r">
                      <button
                        type="button"
                        className="px-4 py-2 bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed-dim rounded font-semibold transition-colors"
                        onClick={() => onSelectProject(project)}
                      >
                        선택
                      </button>
                    </td>
                  </tr>
                ))}

                <tr className="bg-surface-container-low/50 hover:bg-surface-container-low transition-colors group">
                  <td className="px-4 py-4 rounded-l font-bold text-on-surface">
                    신규 프로젝트
                  </td>
                  <td className="px-4 py-4 text-on-surface-variant">
                    프로젝트명으로 신규 등록
                  </td>
                  <td className="px-4 py-4 text-right rounded-r">
                    <button
                      type="button"
                      className="px-4 py-2 bg-primary text-white hover:bg-primary-dim rounded font-semibold transition-colors"
                      onClick={() =>
                        onSelectProject({
                          projectName: keyword || "신규 프로젝트",
                          projectDueDate: "",
                          productionPlanName: `${keyword || "신규 프로젝트"}-1`,
                        })
                      }
                    >
                      신규 등록
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
