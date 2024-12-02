
import CourseService  from "./Services/CourseService.js";
import StudentService from './Services/StudentService.js';
 
const courseService = new CourseService({ dataPath: './Data/courses.json' });
const studentService = new StudentService({ dataPath: './Data/students.json', courseService });

studentService.on("onClickEdit", (e) => {
  console.log('onClickEdit', e);
});

studentService.on('onRenderedData', (e) => {
  console.log('onRenderedData', e);
  setActionButtonEventListenerStudent();
});

courseService.on("onClickEdit", (e) => {
  console.log('onClickEdit', e);
});

courseService.on('onRenderedData', (e) => {
  console.log('onRenderedData', e);
  setActionButtonEventListenerCourse();
});

const students = studentService.readStudents();
const courses= courseService.readCourses();
let activePage = null;

// Start page loading for the first time
document.addEventListener('DOMContentLoaded', () => {
  loadPage('home'); // Load homepage on startup

  // Listen for navigation menu click event
  const links = document.querySelectorAll('nav a');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      loadPage(page); // Load the clicked page
      const activeLink = document.querySelector(".active");
      if (activeLink) {
        activeLink.classList.remove("active");
      }
      link.parentElement.classList.add("active");
    });
  });
});

// A function to load page contents
function loadPage(page) {
  const container = document.getElementById('content');
  const url = `pages/${page}.html`;

  // load the page content with AJAX
  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.text(); // Return page content
      }
      throw new Error('page not found');
    })
    .then(html => {

      container.innerHTML = html; // Add page content to container

      const script = document.createElement('script');
      script.type = "module";
      script.src = `js/${page}.js`;
      script.pageName = page;
      activePage = page;
      script.onload = (e) => {
        console.log(`${page} page and script loaded.`, { e });
      };
      document.body.appendChild(script);

      switch (page) {
        case 'students':
            studentService.renderStudents();
            searchInput.addEventListener('input', () => {
              const searchText = searchInput.value.toLowerCase();
              setStudentFilter(searchText);
            });

            subscribeStudentEvents();

          break;
          case 'courses':
            courseService.renderCourses();
            searchInput.addEventListener('input', () => {
              const searchText = searchInput.value.toLowerCase();
              setCourseFilter(searchText);
            });

            subscribeCourseEvents();
          break;
        default:
            setInfo();
          break;
      }
      
    })
    .catch(error => {
      container.innerHTML = `<p>Hata: ${error.message}</p>`; // Error message
    });
}

// STUDENT ...................................
function subscribeStudentEvents() {
  console.log("subscribeStudentEvents");
  btnAddStudent.addEventListener('click', (e) => {
    addStudent(e);
  });

  btnSaveStudent.addEventListener('click', async (e) => {
    console.log('btnSaveStudent.....', e);
    saveStudent(e).then((response) => {
      console.log("Student added...", response);
      studentForm.reset();
      hideStudentEditForm();
      if (response.studentId) {
        setStudentFilter(response.studentId);
      } else 
        studentService.renderStudents();
    });
  });

  btnCancelStudent.addEventListener('click', (e) => {
    console.log('btnCancelStudent.....', e);
    studentForm.reset();
    hideStudentEditForm();
  });

  // setActionButtonEventListener();
}

function setActionButtonEventListenerStudent() {
  const ibtnDelete =  document.querySelectorAll('[id=ibtnDelete]');
  ibtnDelete?.forEach(item => {
    item?.addEventListener('click', (e) => {
      // const { dataset } = e.target?? {};
      const studentId =  e.target.attributes['dataset-studentId'].value?? -1;
      const studentName =  e.target.attributes['dataset-studentName'].value?? -1;
      const studentSurname =  e.target.attributes['dataset-studentSurname'].value?? -1;
      console.log('ibtnDelete.....', { e, studentId});
      let text = `Are you sure the student will be deleted?\n\nStudent: ${studentId} - ${studentName} ${studentSurname} \n\nEither OK or Cancel.`;
      if (confirm(text)) {
        deleteStudent(studentId);
      };
    });
  });

  const ibtnEdit =  document.querySelectorAll('[id=ibtnEdit]');
  ibtnEdit?.forEach(item => {
    item?.addEventListener('click', (e) => {
      const studentId =  e.target.attributes['dataset-studentId'].value?? -1;
      console.log('ibtnEdit.....', e);
      EditStudent(studentId);
    });
  });
}

function setActionButtonEventListenerCourse() {
  const ibtnDelete =  document.querySelectorAll('[id=ibtnDelete]');
  ibtnDelete?.forEach(item => {
    item?.addEventListener('click', (e) => {
      // const { dataset } = e.target?? {};
      const courseId =  e.target.attributes['dataset-courseId'].value?? -1;
      const courseName =  e.target.attributes['dataset-courseName'].value?? -1;
      console.log('ibtnDeleteStudent.....', { e, courseId});
      let text = `Are you sure the course will be deleted?\n\nCourse: ${courseId} - ${courseName}\n\nEither OK or Cancel.`;
      if (confirm(text)) {
        deleteCourse(courseId);
      };
    });
  });

  const ibtnEdit =  document.querySelectorAll('[id=ibtnEdit]');
  ibtnEdit?.forEach(item => {
    item?.addEventListener('click', (e) => {
      const courseId =  e.target.attributes['dataset-courseId'].value?? -1;
      console.log('ibtnEdit.....', e);
      EditCourse(courseId);
    });
  });
}

function deleteStudent(studentId) { 
  console.log("deleteStudent...", studentId);
  studentService.deleteStudent(studentId).then(response => {
    studentService.renderStudents();
  });
}

function hideStudentEditForm() {
  const studentFormContainer = document.getElementById("form-container");
  studentFormContainer.classList.add("hide");
}

function addStudent(e) { 
  console.log("addStudent...:", e);
  const studentFormContainer = document.getElementById("form-container");
  studentFormContainer.classList.remove("hide");

  const editFormCaption = document.getElementById("editFormCaption");
  editFormCaption.innerHTML = "Add Student";
  studentForm.elements["name"].focus();
  studentForm.elements["studentId"].value = -1;
  studentForm.elements["studentId"].disabled = true;
}

function EditStudent(studentId) {
  console.log("EditStudent...:", studentId);
  const student = studentService.findStudentById(studentId);
  if (!student?.studentId) return;

  const formContainer = document.getElementById("form-container");
  formContainer.classList.remove("hide");

  const editFormCaption = document.getElementById("editFormCaption");
  editFormCaption.innerHTML = "Edit Student";
  studentForm.elements["studentId"].value = student.studentId.toString();
  studentForm.elements["studentId"].disabled = true;
  studentForm.elements["name"].value = student.name;
  studentForm.elements["surname"].value = student.surname;
  studentForm.elements["takenCourses"].value = student.takenCourses;
  studentForm.elements["grades"].value = student.grades;
  studentForm.elements["name"].focus();
}

async function saveStudent(e) {
  const isNew = studentForm.elements["studentId"].value === "-1";

  let studentId = studentForm.elements["studentId"].value;
  // isNew
  if (isNew) {
    studentId = studentService.getMaxId() + 1
  }

  const data = {
    studentId,
    name: studentForm.elements["name"].value,
    surname: studentForm.elements["surname"].value,
    takenCourses: studentForm.elements["takenCourses"]?.value?? [],
    grades: studentForm.elements["grades"]?.value?? [],
  }
  console.log("saveStudent...:", {data});
  isNew ? await studentService.createStudent(data) : await studentService.updateStudent(studentId, data);
  return data;
}

function setStudentFilter(searchText) {
  searchInput.value = searchText.toString();
  const filteredStudents = studentService.searchStudents(searchText);
  studentService.renderStudents(filteredStudents);
}

// COURSE-------------------------------
function subscribeCourseEvents() {
  console.log("subscribeCourseEvents");

  btnAddCourse.addEventListener('click', (e) => {
    addCourse(e);
  });

  btnSaveCourse.addEventListener('click', async (e) => {
    saveCourse(e).then((response) => {
      console.log("Course added...", response);
      courseForm.reset();
      hideCourseEditForm();
      if (response.courseId) {
        setCourseFilter(response.courseId);
      } else 
        courseService.renderCourses();
    });
  });

  btnCancelCourse.addEventListener('click', (e) => {
    courseForm.reset();
    hideCourseEditForm();
  });
}

function hideCourseEditForm() {
  const formContainer = document.getElementById("form-container");
  formContainer.classList.add("hide");
}

function addCourse(e) { 
  console.log("addCourse...:", e);
  const formContainer = document.getElementById("form-container");
  formContainer.classList.remove("hide");

  const editFormCaption = document.getElementById("editFormCaption");
  editFormCaption.innerHTML = "Add Course";
  courseForm.elements["name"].focus();
  courseForm.elements["courseId"].value = -1;
  courseForm.elements["courseId"].disabled = true;
}

function setCourseFilter(searchText) {
  searchInput.value = searchText.toString();
  const filteredData = courseService.searchCourses(searchText);
  courseService.renderCourses(filteredData);
}

async function saveCourse(e) {
  console.log("saveCourse...:", e);
  const isNew = courseForm.elements["courseId"].value === "-1";

  let courseId = courseForm.elements["courseId"].value;
  // isNew
  if (isNew) {
    courseId = courseService.getMaxId() + 1;
  }

  const data = {
    courseId,
    name: courseForm.elements["name"].value,
    instructor: courseForm.elements["instructor"]?.value?? "",
    ects: courseForm.elements["ects"]?.value?? "",
    midtermPercent: courseForm.elements["midtermPercent"]?.value?? "",
    isTenBased: courseForm.elements["isTenBased"]?.value === "true"
  }
  console.log("saveCourse...:", {data});
  isNew ? await courseService.createCourse(data) : await courseService.updateCourse(courseId, data);
  return data;
}

function deleteCourse(courseId) { 
  console.log("deleteCourse...", courseId);
  courseService.deleteCourse(courseId).then(response => {
    courseService.renderCourses();
  });
}

function EditCourse(courseId) {
  console.log("EditCourse...:", courseId);
  const course = courseService.findCourseById(courseId);
  if (!course?.courseId) return;

  const formContainer = document.getElementById("form-container");
  formContainer.classList.remove("hide");

  const editFormCaption = document.getElementById("editFormCaption");
  editFormCaption.innerHTML = "Edit Course";
  courseForm.elements["courseId"].value = course.courseId.toString();
  courseForm.elements["courseId"].disabled = true;
  courseForm.elements["name"].value = course.name;
  courseForm.elements["instructor"].value = course.instructor;
  courseForm.elements["ects"].value = course.ects;
  courseForm.elements["midtermPercent"].value = course.midtermPercent;
  courseForm.elements["isTenBased"].value = course.isTenBased;

  courseForm.elements["name"].focus();
}


// HOME .....

function setInfo() {
  const studentCount = document.getElementById("studentCount");
  const courseCount = document.getElementById("courseCount");

  studentCount.innerHTML = studentService.studentCount;
  courseCount.innerHTML = courseService.courseCount;

  const students = studentService.students;
  const courseDetails =  document.getElementById("courseDetails");

  const courses = courseService.courses;
  courses.forEach(course => {
    const count  = studentService.studentCountByCourse(course.courseId);

    const div = document.createElement('div');
    div.id = "courseDetail";
    div.className = "courseDetail",
    
    div.innerHTML = `

        <span>${course.name}</span>
        <span style="text-align: right">${count}</span>`
     ;
      courseDetails.appendChild(div);
  });

} 