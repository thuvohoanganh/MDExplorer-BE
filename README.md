# MDExplorer
1. npm install
2. npm run dev

# APIs
1. Get all subject id.
   * GET - http://localhost:8000/api/subject/list
2. Get multimodal data of a subject
   * GET - http://localhost:8000/api/subject/multimodal-data/${subject_id}
   * e.g http://localhost:8000/api/subject/multimodal-data/1
3. Get statistic of one datatype
   * POST - http://localhost:8000/api/subject/statistic
   * body { "subject_id": 4, "data_type": "E4_HR" }
4. Get data of one data type from all subjects
   * POST - http://localhost:8000/api/datatype/all-subjects
   * body { "data_type": "HR" }
5. Get meta data of one data type
   * POST - http://localhost:8000/api/datatype/metadata
   * body { "data_type": "HR" }
