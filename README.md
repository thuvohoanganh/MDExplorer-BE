#Documentation
https://docs.google.com/document/d/1dg0ueT2XM0rJ2dlfJ731yGq47cOdkYPbpHfphn-auyA/edit

# MDExplorer
1. npm install
2. npm run dev
3. Try to fetch data in FE component
   e.g:
```
   function ExampleComponent(props){
     useEffect(() => {
       axios.post("http://localhost:8000/api/datatype/all-subjects", { "data_type": "E4_HR" })
            .then((res) => { console.log(res.data.data) })
            .catch(err => { console.error(err) });
        };
     }, [])
     return (<div></div>)
   }
```

# APIs
1. Get all subject id.
   * POST - http://localhost:8000/api/subject/list
   * body { "dataset_name": "k-emocon" }
2. Get multimodal data of a subject
   * POST - http://localhost:8000/api/subject/multimodal-data
   * body { "dataset_name": "k-emocon" }
3. Get meta data of one data type
   * POST - http://localhost:8000/api/datatype/metadata
   * body { "data_type": "E4_BVP", "dataset_name": "k-emocon" }
4. Get statistic of one datatype
   * POST - http://localhost:8000/api/subject/statistic
   * body { "subject_id": 4, "data_type": "E4_HR", "dataset_name": "k-emocon" }
6. Get data of one data type from all subjects
   * POST - http://localhost:8000/api/datatype/all-subjects
   * body { "data_type": "E4_BVP", "dataset_name": "k-emocon" }
7. Get all data types
   * POST - http://localhost:8000/api/datatype/list
   * body { "dataset_name": "k-emocon" }
