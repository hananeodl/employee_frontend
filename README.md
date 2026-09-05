## [Devias Kit - React](https://material-kit-react.devias.io/)


[![Devias Kit - React](https://github.com/devias-io/material-kit-react/blob/main/public/assets/thumbnail.png)](https://material-kit-react.devias.io/)


---

# 2. `employee_frontend` — Frontend README

For the second repository:

:contentReference[oaicite:1]{index=1}

I recommend a separate README rather than duplicating the backend documentation.

```markdown
# Employee Management System — Frontend

Frontend application for a **microservices-based Employee Management System**, developed as part of an academic team project.

The application provides the user interface for interacting with the employee management platform and communicates with the backend through the **API Gateway**.

> 🎓 Academic team project  
> 🔗 Backend: [employee_system](https://github.com/hananeodl/employee_system)

---

## 📌 Overview

The frontend acts as the user-facing layer of the Employee Management System.

Instead of communicating directly with each microservice, the frontend communicates through the **API Gateway**, which acts as the centralized entry point to the backend architecture.

```text
┌──────────────────────┐
│       Frontend       │
│        React         │
└──────────┬───────────┘
           │
           │ HTTPS
           ▼
┌──────────────────────┐
│     API Gateway      │
└──────────┬───────────┘
           │
           ├──────────────► Employee Profile
           │
           ├──────────────► Payroll
           │
           ├──────────────► Absence Management
           │
           └──────────────► Performance Review


- Licensed under [MIT](https://github.com/devias-io/material-kit-react/blob/main/LICENSE.md)

## Contact Us

- Email Us: support@deviasio.zendesk.com
