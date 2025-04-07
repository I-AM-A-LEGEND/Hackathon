import React, { useState, useEffect, useCallback } from 'react';

interface StudyMaterial {
  id: number;
  title: string;
  description: string;
  type: MaterialType;
  url?: string;
  content?: string;
}

type MaterialType = 'document' | 'video' | 'link' | 'note';

interface StudyMaterialsProps {
  studyPlanId: number;
}

// Type guard for note type
const isNoteType = (type: MaterialType): type is 'note' => {
  return type === 'note';
};

const StudyMaterials: React.FC<StudyMaterialsProps> = ({ studyPlanId }) => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    type: MaterialType;
    url: string;
    content: string;
  }>({
    title: '',
    description: '',
    type: 'document',
    url: '',
    content: '',
  });

  const fetchMaterials = useCallback(async () => {
    try {
      const response = await fetch(`/api/study-materials?studyPlanId=${studyPlanId}`);
      if (!response.ok) throw new Error('Failed to fetch materials');
      const data = await response.json();
      setMaterials(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [studyPlanId]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/study-materials?studyPlanId=${studyPlanId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to create material');
      await fetchMaterials();
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        type: 'document',
        url: '',
        content: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'type') {
      // Ensure type is cast to a valid MaterialType
      const typeValue = value as MaterialType;
      setFormData(prev => ({ ...prev, type: typeValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (loading) return <div className="text-center">Loading materials...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Study Materials</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {showForm ? 'Cancel' : 'Add Material'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="document">Document</option>
              <option value="video">Video</option>
              <option value="link">Link</option>
              <option value="note">Note</option>
            </select>
          </div>
          {!isNoteType(formData.type) && (
            <div>
              <label className="block text-sm font-medium text-gray-700">URL</label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required={!isNoteType(formData.type)}
              />
            </div>
          )}
          {isNoteType(formData.type) && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Content</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={5}
                required={isNoteType(formData.type)}
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Add Material
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map(material => (
          <div key={material.id} className="p-4 bg-white rounded shadow">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 rounded text-sm ${
                material.type === 'document' ? 'bg-blue-100 text-blue-800' :
                material.type === 'video' ? 'bg-red-100 text-red-800' :
                material.type === 'link' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {material.type}
              </span>
            </div>
            <h3 className="text-lg font-medium">{material.title}</h3>
            <p className="text-gray-600">{material.description}</p>
            {material.url && (
              <a
                href={material.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-blue-500 hover:text-blue-600"
              >
                Open {material.type}
              </a>
            )}
            {material.content && (
              <div className="mt-2 p-2 bg-gray-50 rounded">
                <p className="text-sm text-gray-700">{material.content}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyMaterials; 