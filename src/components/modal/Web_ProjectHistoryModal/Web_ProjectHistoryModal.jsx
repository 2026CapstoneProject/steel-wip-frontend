import { useMemo, useState } from "react";

const initialProjects = [
  {
    id: 1,
    projectName: "토네이도 건설",
    projectDueDate: "2026-03-06",
  },
  {
    id: 2,
    projectName: "토네이도 I&C",
    projectDueDate: "2026-03-10",
  },
];

export default function Web_ProjectHistoryModal({ onClose, onSelectProject }) {
  const [keyword, setKeyword] = useState("");
  const [projects, setProjects] = useState(initialProjects);

  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState({
    projectName: "",
    projectDueDate: "",
  });

  const [newProjectForm, setNewProjectForm] = useState({
    projectName: "",
    projectDueDate: "",
  });

  const filteredProjects = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase();

    if (!trimmed) return projects;

    return projects.filter((project) =>
      project.projectName.toLowerCase().includes(trimmed),
    );
  }, [keyword, projects]);

  const handleEditStart = (project) => {
    setEditingId(project.id);
    setEditingForm({
      projectName: project.projectName,
      projectDueDate: project.projectDueDate,
    });
  };

  const handleEditChange = (name, value) => {
    setEditingForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSave = (projectId) => {
    if (!editingForm.projectName || !editingForm.projectDueDate) {
      alert("프로젝트 명과 납기일을 모두 입력해주세요.");
      return;
    }

    setProjects((prev) =>
      prev.map((project) =>
        project.id === projectId
          ? {
              ...project,
              projectName: editingForm.projectName,
              projectDueDate: editingForm.projectDueDate,
            }
          : project,
      ),
    );

    // 저장 후에만 다시 선택 가능
    setEditingId(null);
  };

  const handleNewProjectChange = (name, value) => {
    setNewProjectForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegisterNewProject = () => {
    if (!newProjectForm.projectName || !newProjectForm.projectDueDate) {
      alert("프로젝트 명과 납기일을 모두 입력해주세요.");
      return;
    }

    const newProject = {
      id: Date.now(),
      projectName: newProjectForm.projectName,
      projectDueDate: newProjectForm.projectDueDate,
    };

    setProjects((prev) => [newProject, ...prev]);

    onSelectProject({
      projectName: newProject.projectName,
      projectDueDate: newProject.projectDueDate,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-[1px]">
      <div className="w-full max-w-5xl bg-surface-container-lowest rounded-modal shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col">
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
            <table className="w-full border-separate border-spacing-y-3">
              <thead>
                <tr className="text-on-surface-variant text-xs font-bold uppercase tracking-wider font-label">
                  <th className="px-4 py-2 text-left">프로젝트 명</th>
                  <th className="px-4 py-2 text-left">납기일</th>
                  <th className="px-4 py-2 text-right">실행</th>
                </tr>
              </thead>

              <tbody className="font-body text-sm">
                {/* 신규 등록 행 */}
                <tr className="bg-surface-container-low/50">
                  <td className="px-4 py-4 rounded-l">
                    <input
                      type="text"
                      value={newProjectForm.projectName}
                      onChange={(e) =>
                        handleNewProjectChange("projectName", e.target.value)
                      }
                      placeholder="프로젝트 명 입력"
                      className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded px-3 py-2 text-sm"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <input
                      type="date"
                      value={newProjectForm.projectDueDate}
                      onChange={(e) =>
                        handleNewProjectChange("projectDueDate", e.target.value)
                      }
                      className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded px-3 py-2 text-sm"
                    />
                  </td>
                  <td className="px-4 py-4 text-right rounded-r">
                    <button
                      type="button"
                      className="px-4 py-2 bg-primary text-white hover:bg-primary-dim rounded font-semibold transition-colors"
                      onClick={handleRegisterNewProject}
                    >
                      신규 등록
                    </button>
                  </td>
                </tr>

                {/* 기존 프로젝트 행 */}
                {filteredProjects.map((project) => {
                  const isEditing = editingId === project.id;

                  return (
                    <tr
                      key={project.id}
                      className="bg-surface-container-low/50 hover:bg-surface-container-low transition-colors"
                    >
                      <td className="px-4 py-4 rounded-l font-bold text-on-surface">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editingForm.projectName}
                            onChange={(e) =>
                              handleEditChange("projectName", e.target.value)
                            }
                            className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded px-3 py-2 text-sm"
                          />
                        ) : (
                          project.projectName
                        )}
                      </td>

                      <td className="px-4 py-4">
                        {isEditing ? (
                          <input
                            type="date"
                            value={editingForm.projectDueDate}
                            onChange={(e) =>
                              handleEditChange("projectDueDate", e.target.value)
                            }
                            className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded px-3 py-2 text-sm"
                          />
                        ) : (
                          project.projectDueDate
                        )}
                      </td>

                      <td className="px-4 py-4 text-right rounded-r">
                        <div className="flex justify-end gap-2">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                className="px-4 py-2 bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed-dim rounded font-semibold transition-colors"
                                onClick={() => handleEditSave(project.id)}
                              >
                                저장
                              </button>

                              <button
                                type="button"
                                className="px-4 py-2 bg-surface-container text-on-surface hover:bg-surface-container-high rounded font-semibold transition-colors"
                                onClick={() => setEditingId(null)}
                              >
                                취소
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                className="px-4 py-2 border border-primary/30 text-primary hover:bg-primary-container/40 rounded font-semibold transition-colors"
                                onClick={() => handleEditStart(project)}
                              >
                                수정
                              </button>

                              <button
                                type="button"
                                className="px-4 py-2 bg-primary text-white hover:bg-primary-dim rounded font-semibold transition-colors"
                                onClick={() =>
                                  onSelectProject({
                                    projectName: project.projectName,
                                    projectDueDate: project.projectDueDate,
                                  })
                                }
                              >
                                선택
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredProjects.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-8 text-center text-on-surface-variant"
                    >
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
