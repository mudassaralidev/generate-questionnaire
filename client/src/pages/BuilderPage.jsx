import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBuilder } from "../context/BuilderContext";
import QuestionList from "../components/builder/QuestionList";
import QuestionEditor from "../components/builder/QuestionEditor";
import BuilderHeader from "../components/builder/BuilderHeader";

export default function BuilderPage() {
  const navigate = useNavigate();
  const { meta } = useBuilder();

  useEffect(() => {
    if (!meta.tenant) navigate("/", { replace: true });
  }, [meta.tenant, navigate]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <BuilderHeader />

      <div className="flex overflow-hidden flex-1">
        <div className="w-2/5 overflow-hidden border-r border-gray-200">
          <QuestionList />
        </div>

        <div className="w-3/5 overflow-hidden bg-white">
          <QuestionEditor />
        </div>
      </div>
    </div>
  );
}
