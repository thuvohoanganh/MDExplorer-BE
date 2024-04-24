# MDExplorer
1. npm install
2. npm run dev

# APIs
1. GET - http://localhost:8000/api/subjects/list.
   * Get all subject id.
2. GET - http://localhost:8000/api/subject/multimodal-data/${subject_id}.
   * Get multimodal data of a subject.
   * e.g http://localhost:8000/api/subject/multimodal-data/1.
3. POST - http://localhost:8000/api/datatype/all-subjects
   * body { "data_type": "HR" }
