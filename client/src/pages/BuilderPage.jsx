import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBuilder } from "../context/BuilderContext";
import QuestionList from "../components/builder/QuestionList";
import QuestionEditor from "../components/builder/QuestionEditor";
import ConfirmationPopupEditor from "../components/builder/ConfirmationPopupEditor";
import BuilderHeader from "../components/builder/BuilderHeader";

export default function BuilderPage() {
  const navigate = useNavigate();
  const { meta, is_confirmation_popup } = useBuilder();

  useEffect(() => {
    if (!meta.tenant) navigate("/", { replace: true });
  }, [meta.tenant, navigate]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <BuilderHeader />

      {is_confirmation_popup ? (
        <div className="flex-1 overflow-hidden bg-white">
          <ConfirmationPopupEditor />
        </div>
      ) : (
        <div className="flex overflow-hidden flex-1">
          <div className="w-2/5 overflow-hidden border-r border-gray-200">
            <QuestionList />
          </div>

          <div className="w-3/5 overflow-hidden bg-white">
            <QuestionEditor />
          </div>
        </div>
      )}
    </div>
  );
}
