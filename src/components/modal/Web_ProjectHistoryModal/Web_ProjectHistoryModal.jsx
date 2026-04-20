import { useEffect, useState } from "react";
import { searchProjects, createProject, updateProject } from "../../../services/projectService";

export default function Web_ProjectHistoryModal({ onClose, onSelectProject }) {
  const [keyword, setKeyword] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState({ projectName: "", projectDueDate: "" });

  const [newProjectForm, setNewProjectForm] = useState({ projectName: "", projectDueDate: "" });
  const [saving, setSaving] = useState(false);

  // 컴포넌트 마운트 시 전체 프로젝트 조회
  useEffect(() => {
    fetchProjects("");
  }, []);

  const fetchProjects = async (search) => {
    setLoading(true);
    try {
      const response = await searchProjects(search);
      const data = response.data?.data?.projects ?? [];
      // 백엔드 ProjectResponse → 모달 행 형태 변환
      setProjects(
        data.map((p) => ({
          id: p.id,
          projectName: p.title,
          projectDueDate: p.project_due ? String(p.project_due).slice(0, 10) : "",
        }))
      );
    } catch (err) {
      console.error("프로젝트 조회 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchProjects(keyword.trim());
  };

  const handleEditStart = (project) => {
    setEditingId(project.id);
    setEditingForm({ projectName: project.projectName, projectDueDate: project.projectDueDate });
  };

  const handleEditChange = (name, value) => {
    setEditingForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async (projectId) => {
    if (!editingForm.projectName || !editingForm.projectDueDate) {
      alert("프로젝트 명과 납기일을 모두 입력해주세요.");
      return;
    }
    setSaving(true);
    try {
      await updateProject(projectId, {
        title: editingForm.projectName,
        project_due: editingForm.projectDueDate,
      });
      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? { ...p, projectName: editingForm.projectName, projectDueDate: editingForm.projectDueDate }
            : p
        )
      );
      setEditingId(null);
    } catch (err) {
      console.error("프로젝트 수정 실패:", err);
      alert("프로젝트 수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleNewProjectChange = (name, value) => {
    setNewProjectForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterNewProject = async () => {
    if (!newProjectForm.projectName || !newProjectForm.projectDueDate) {
      alert("프로젝트 명과 납기일을 모두 입력해주세요.");
      return;
    }
    setSaving(true);
    try {
      const response = await createProject({
        title: newProjectForm.projectName,
        project_due: newProjectForm.projectDueDate,
      });
      const newProject = response.data?.data;
      onSelectProject({
        id: newProject.id,
        projectName: newProject.title,
        projectDueDate: String(newProject.project_due).slice(0, 10),
      });
    } catch (err) {
      console.error("프로젝트 생성 실패:", err);
      alert("프로젝트 생성에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-[1px]">
      <div className="w-full max-w-5xl bg-surface-container-lowest rounded-modal shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col">
        <div className="px-8 py-6 flex items-center justify-between border-b border-surface-container">
          <h2 className="text-xl font-bold text-on-surface tracking-tight font-headline">
            프로젝트 이력 조회
          </h2>
          <button type="button" className="text-on-surface-variant hover:text-on-surface transition-colors" onClick={onClose}>
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
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="프로젝트 명을 입력하세요"
                className="w-full pl-12 pr-4 py-3 bg-surface-container-low border-0 rounded text-on-surface placeholder:text-on-surface-variant/60 font-body transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              className="px-6 py-3 bg-primary hover:bg-primary-dim text-white font-semibold rounded shadow-sm flex items-center gap-2 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">search</span>
              검색
            </button>
          </div>

          {loading && (
            <div className="py-8 text-center text-sm text-on-surface-variant">프로젝트 목록을 불러오는 중...</div>
          )}

          {!loading && (
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
                        onChange={(e) => handleNewProjectChange("projectName", e.target.value)}
                        placeholder="프로젝트 명 입력"
                        className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded px-3 py-2 text-sm"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <input
                        type="date"
                        value={newProjectForm.projectDueDate}
                        onChange={(e) => handleNewProjectChange("projectDueDate", e.target.value)}
                        className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded px-3 py-2 text-sm"
                      />
                    </td>
                    <td className="px-4 py-4 text-right rounded-r">
                      <button
                        type="button"
                        disabled={saving}
                        className="px-4 py-2 bg-primary text-white hover:bg-primary-dim rounded font-semibold transition-colors disabled:opacity-60"
                        onClick={handleRegisterNewProject}
                      >
                        신규 등록
                      </button>
                    </td>
                  </tr>

                  {/* 기존 프로젝트 행 */}
                  {projects.map((project) => {
                    const isEditing = editingId === project.id;
                    return (
                      <tr key={project.id} className="bg-surface-container-low/50 hover:bg-surface-container-low transition-colors">
                        <td className="px-4 py-4 rounded-l font-bold text-on-surface">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingForm.projectName}
                              onChange={(e) => handleEditChange("projectName", e.target.value)}
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
                              onChange={(e) => handleEditChange("projectDueDate", e.target.value)}
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
                                  disabled={saving}
                                  className="px-4 py-2 bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed-dim rounded font-semibold transition-colors disabled:opacity-60"
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
                                      id: project.id,
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

                  {projects.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-on-surface-variant">
                        검색 결과가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
