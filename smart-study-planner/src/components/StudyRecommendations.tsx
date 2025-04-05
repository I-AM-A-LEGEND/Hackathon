import React, { useState, useEffect, useCallback } from 'react';

interface StudyRecommendation {
  id: number;
  type: 'schedule' | 'material' | 'technique' | 'reminder';
  content: string;
  priority: 'low' | 'medium' | 'high';
  isApplied: boolean;
}

interface StudyRecommendationsProps {
  studyPlanId: number;
}

const StudyRecommendations: React.FC<StudyRecommendationsProps> = ({ studyPlanId }) => {
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'schedule' as const,
    content: '',
    priority: 'medium' as const,
  });

  const fetchRecommendations = useCallback(async () => {
    try {
      const response = await fetch(`/api/study-recommendations?studyPlanId=${studyPlanId}`);
      if (!response.ok) throw new Error('Failed to fetch recommendations');
      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [studyPlanId]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/study-recommendations?studyPlanId=${studyPlanId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to create recommendation');
      await fetchRecommendations();
      setShowForm(false);
      setFormData({
        type: 'schedule',
        content: '',
        priority: 'medium',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyRecommendation = async (id: number, isApplied: boolean) => {
    try {
      const response = await fetch(`/api/study-recommendations?studyPlanId=${studyPlanId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isApplied }),
      });
      if (!response.ok) throw new Error('Failed to update recommendation');
      await fetchRecommendations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (loading) return <div className="text-center">Loading recommendations...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">AI Study Recommendations</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {showForm ? 'Cancel' : 'Add Recommendation'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="schedule">Schedule</option>
              <option value="material">Material</option>
              <option value="technique">Study Technique</option>
              <option value="reminder">Reminder</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add Recommendation
          </button>
        </form>
      )}

      <div className="space-y-4">
        {recommendations.map(recommendation => (
          <div
            key={recommendation.id}
            className={`p-4 rounded shadow ${
              recommendation.isApplied ? 'bg-green-50' : 'bg-white'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    recommendation.type === 'schedule' ? 'bg-blue-100 text-blue-800' :
                    recommendation.type === 'material' ? 'bg-purple-100 text-purple-800' :
                    recommendation.type === 'technique' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {recommendation.type}
                  </span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    recommendation.priority === 'high' ? 'bg-red-100 text-red-800' :
                    recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {recommendation.priority}
                  </span>
                </div>
                <p className="text-gray-700">{recommendation.content}</p>
              </div>
              <button
                onClick={() => handleApplyRecommendation(recommendation.id, !recommendation.isApplied)}
                className={`px-3 py-1 rounded text-sm ${
                  recommendation.isApplied
                    ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
              >
                {recommendation.isApplied ? 'Applied' : 'Apply'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyRecommendations; 