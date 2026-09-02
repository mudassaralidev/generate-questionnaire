import { useState } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { isQuestionVisible, buildQuestionsById } from '../../utils/visibility';

function QuestionField({ question, value, onChange }) {
  const { type, description, answer_key, options = [], validations = {} } = question;

  const inputCls = 'input mt-1';

  switch (type) {
    case 'text':
      return (
        <input
          className={inputCls}
          placeholder={description || answer_key}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'textarea':
      return (
        <textarea
          className={`${inputCls} min-h-[80px] resize-y`}
          placeholder={description || answer_key}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'number':
      return (
        <input
          className={inputCls}
          type="number"
          placeholder={description || answer_key}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'date':
      return (
        <input
          className={inputCls}
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'radio':
      return (
        <div className="mt-1 space-y-1.5">
          {options.map((opt) => (
            <label key={opt._id} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="radio"
                name={answer_key}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      );
    case 'checkbox':
      return (
        <div className="mt-1 space-y-1.5">
          {options.map((opt) => {
            const vals = [].concat(value || []);
            return (
              <label key={opt._id} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  value={opt.value}
                  checked={vals.includes(opt.value)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...vals, opt.value]
                      : vals.filter((v) => v !== opt.value);
                    onChange(next);
                  }}
                  className="h-4 w-4 rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            );
          })}
        </div>
      );
    case 'dropdown':
      return (
        <select
          className={`${inputCls} bg-white`}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt._id} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    case 'image':
      return (
        <div className="mt-1 rounded-lg border-2 border-dashed border-gray-200 p-4 text-center bg-gray-50">
          <svg className="mx-auto h-8 w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-1 text-xs text-gray-400">Image upload (preview only)</p>
        </div>
      );
    default:
      return <p className="text-xs text-gray-400">Unknown type: {type}</p>;
  }
}

export default function FormPreview() {
  const { questions } = useBuilder();
  const [answers, setAnswers] = useState({});

  const questionsById = buildQuestionsById(questions);
  const sorted = [...questions].sort((a, b) => a.order - b.order);

  const setAnswer = (key, val) => setAnswers((a) => ({ ...a, [key]: val }));

  if (questions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-gray-400 text-sm">
        No questions to preview
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800">Form Preview</h3>
          <button
            onClick={() => setAnswers({})}
            className="btn-secondary py-1.5 text-xs"
          >
            Reset
          </button>
        </div>

        {sorted.map((q) => {
          const visible = isQuestionVisible(q, answers, questionsById);
          if (!visible) return null;

          return (
            <div
              key={q._id}
              className="card p-4 transition-all animate-fade-in"
            >
              <div className="flex items-start justify-between mb-2">
                <label className="text-sm font-medium text-gray-800">
                  {q.description || q.answer_key}
                  {q.validations?.required && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </label>
                <span className="text-xs text-gray-400 font-mono">{q.answer_key}</span>
              </div>
              <QuestionField
                question={q}
                value={answers[q.answer_key]}
                onChange={(val) => setAnswer(q.answer_key, val)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
