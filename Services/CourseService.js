import EventEmitter from "./EventEmitter.js";
class CourseService extends EventEmitter {
  constructor( { dataPath }) {
    super();
    this.key = "courses";
    this.dataPath = dataPath?? './data/courses.json';

    this.initData();
  }

  async initData() {
    if (!localStorage.getItem('courses')) {
        const data = await this.fetchData();
        localStorage.setItem('courses', JSON.stringify(data)); 
     }
  }

  async fetchData() {
    try {
      const response = await fetch(this.dataPath);
      const courses = await response.json();

      // Ensure takenCourses is always an array
      return courses.map((courses) => ({
        ...courses,
        takenCourses: courses.takenCourses || [], // Default to an empty array
        grades: courses.grades || [], // Default to an empty array
      }));
    } catch (error) {
      console.error("Error fetching courses:", error);
      return []; // Return an empty array in case of error
    }
  }

  // Read all courses
  readCourses() {
    const courses = JSON.parse(localStorage.getItem(this.key)) || [];
    return courses;
  }

  findCourseById(id) {
    const course = this.readCourses();
    return course.find(item => item.courseId === +id);
  }
  // Create a new course
  createCourse(newCourse) {
    const courses = this.readCourses();
    courses.push(newCourse);
    this.saveCourses(courses);
  }

  // Update a Course by ID
  updateCourse(courseId, updatedCourse) {
    const courses = this.readCourses();
    const index = courses.findIndex(course => course.courseId === +courseId);
    delete updatedCourse.courseId;
    if (index !== -1) {
      courses[index] = { ...courses[index], ...updatedCourse };
        this.saveCourses(courses);
    } else {
        console.log(`Course with ID ${courseId} not found.`);
    }
  }

  // Delete a Course by ID
  async deleteCourse(courseId) {
    const courses = this.readCourses();
    const filteredCourses = courses.filter(course => course.courseId !== +courseId); // it hs to number type
    await this.saveCourses(filteredCourses);
    return courseId;
  }

  // Save courses to localStorage
  async saveCourses(courses) {
    localStorage.setItem(this.key, JSON.stringify(courses));
    return courses;
  }

  // Edit course 
  editCourses(courses) {
    localStorage.setItem(this.key, JSON.stringify(courses));
  }

  renderCourses(data = null) {
    const courseTableBody = document.querySelector("#courseTable tbody");
    courseTableBody.innerHTML = "";
    const coursesToRender = data?? this.readCourses();
    coursesToRender.forEach((course, index) => {
      const row = document.createElement('tr');
      row.classList.add(index % 2 === 0 ? "even" : "odd");
      row.dataset.data = JSON.stringify(course);
      row.dataset.rowIndex = index;

      row.innerHTML = `
               <td>${index + 1}</td>
               <td>${course.name}</td>
               <td>${course.courseId}</td>
               <td>${course.instructor}</td>
               <td>${course.ects}</td>
               <td>${course.midtermPercent}</td>
               <td>${course.isTenBased}</td>

               <i id="ibtnEdit" class="material-icons icon" style="font-size:24px; cursor: pointer" title="Edit" 
                   dataset-courseId="${course.courseId}"
                   dataset-courseName="${course.name}"
               >edit</i>
               <i id="ibtnDelete" class="material-icons icon" style="font-size:24px; cursor: pointer" title="Delete"
                   dataset-courseId="${course.courseId}"
                   dataset-courseName="${course.name}"
               >delete</i>
               </td> `;

      row.addEventListener("click", function (e) {
        const tr = e.target.closest('tr');
        const { dataset } = tr?? {};

        console.log("tr:", { data: dataset?.data?? null, rowIndex: dataset.rowIndex });
        const focusedRow = document.querySelector(".focused");
        if (focusedRow) {
          focusedRow.classList.remove("focused");
        }
        row.classList.add("focused");
      });

      courseTableBody.appendChild(row);
    });
    this.emit("onRenderedData", data);
  }

  //  search
  searchCourses(keyword) {
    const courses = this.readCourses();
    keyword = keyword.toString().toLowerCase();
    const filteredCourses = courses.filter(
      (course) =>
        course.name.toLowerCase().includes(keyword) ||
        course.instructor.toLowerCase().includes(keyword) ||
        course.courseId.toString().includes(keyword)
    );
    return filteredCourses;
  }

  getMaxId() {
    const data = this.readCourses();
    if (data.length === 0) return 0; // If the course does not exist, return 0.
    
    // Check the courseId of each course in the array and take the largest one.
    const maxId = data.reduce((max, course) => {
      return course.courseId > max ? course.courseId : max;
    }, 0);  // The initial value is 0 because we need to calculate the lowest possible id of 0.
    
    return maxId;
  }

  get courseCount() {
    const data = this.readCourses();
    return data?.length?? 0;
  }
  get courses() {
    return this.readCourses();
  }
}

export default CourseService;
