# 🚀 n8n Custom NocoDB Node

A **custom n8n node for working with NocoDB** — built to be actually pleasant to use.

- No manual query strings.  
- No guessing field names.  
- No unreadable relation payloads.

Just a **proper UI-driven experience**, the way it should’ve been from the start.

- - -

## 🤖 AI Tool node is supported

- Go to settings => Community nodes
- Click "Install"
- Paste "n8n-nodes-nocodb-custom"

- - -

## Installation

- - -

## ✨ Supported Operations

*   **Create row**
    
*   **Delete row**
    
*   **Update row**
    
*   **Get row**
    
*   **List rows**
    
*   **Count rows**

- - -

## 🤔 Why Another NocoDB Node?

The official NocoDB node _works_, but once you go beyond the basics, things get painful fast.

This custom node focuses on:

*   **Developer Experience**
    
*   **Readable data**
    
*   **UI-first configuration**
    
*   **Scalability for real workflows**
    

- - -

## 🔍 Filtering: Official Node vs This Node

### ❌ Official n8n NocoDB Node

Filtering for **Get row / Get rows** is done by **manually typing query parameters**:

```text
where=(field1,eq,value1)~and(field2,eq,value2)
```

*   Error-prone
    
*   Hard to read

*   Hard to automate
    
*   Hard to maintain
    
*   No visual structure

Honestly… not great.

- - -

### ✅ This Custom Node

Filtering for **Get row**, **List rows**, and **Count rows** is done **entirely through the UI**.

You can:

*   Add **multiple filter groups**
    
*   Choose **AND / OR** logic per group
    
*   Combine conditions visually
    
*   Actually understand what you’re building
    
<img width="100%" height="700" alt="Group 4 (1)" src="https://github.com/user-attachments/assets/9334a104-e7aa-4b2b-ad78-42571c09f48b" />

- - -

## 🔗 Handling Relation (Link) Fields

### ❌ Official Node Output (Link fields)

The official node returns deeply nested, noisy structures:

```json
{
  "Id": 1,
  "CreatedAt": "2026-01-30 15:29:56+00:00",
  "UpdatedAt": "2026-01-30 15:38:02+00:00",
  "Title": "Not test",
  "Some field": 1,
  "_nc_m2m_Collections_Products": [
    {
      "Products_id": 11,
      "Collections_id": 1,
      "Products": {
        "Collections": 1,
        "Id": 11,
        "CreatedAt": "2026-01-30 15:37:33+00:00",
        "UpdatedAt": "2026-01-30 15:37:33+00:00",
        "Title": "Test"
      }
    }
  ]
}
```

- - -

### ✅ This Custom Node Output

For **Get row** and **Get all**, there’s an additional option:

**`Expand Relations`** (default: `false`)

*   If **disabled** → relation fields return only linked IDs
    
*   If **enabled** → relations are expanded in a clean, predictable structure
    

```json
{
  "id": 1,
  "fields": {
    "CreatedAt": "2026-01-30 15:29:56+00:00",
    "UpdatedAt": "2026-01-30 15:38:02+00:00",
    "Title": "Not test",
    "Some field": [
      {
        "id": 11,
        "fields": {
          "Title": "Test"
        }
      }
    ]
  }
}
```

> ⚠️ Note: Relation handling will be improved further in future versions.

- - -

## 🎯 Selecting Returned Fields

### ❌ Official Node

You must manually type field names, separated by commas.

*   Typos happen
    
*   No autocomplete
    
*   No validation
    

- - -

### ✅ This Custom Node

*   Field selection via **UI dropdown**
    
*   **All available fields are loaded dynamically**
    
*   No guessing, no mistakes
    
<img width="100%" height="700" alt="Group 5 (1)" src="https://github.com/user-attachments/assets/a3f31420-e1d1-40cc-97a1-444dbe1f6617" />

- - -

## 📄 Pagination Support

### ❌ Official Node

*   ❌ No pagination support for **Get all**
    

### ✅ This Custom Node

*   ✅ Pagination supported via **`Page`** option
    
*   Available for **List rows**
    

Perfect for large datasets and production workflows.

- - -

## 🧠 Summary

| Feature | Official Node | This Node |
| --- | --- | --- |
| UI-based filtering | ❌   | ✅   |
| Filter groups (AND / OR) | ❌   | ✅   |
| Clean relation output | ❌   | ✅   |
| Expand relations toggle | ❌   | ✅   |
| Dynamic field selection | ❌   | ✅   |
| Pagination | ❌   | ✅   |

- - -

## 🔥 Who Is This For?

*   n8n users working seriously with NocoDB
    
*   Anyone tired of writing query strings by hand
    
*   Teams that value clean, maintainable workflows
    
*   Developers who want their automations to scale
    
*   Prepare a **GitHub release description**
    
*   Or make a **README badge set** 😏

## 🤝 Need Custom Automation or Integration?

If this node doesn’t fully cover your use case — or you need something **tailored specifically to your workflow**, I’m open for custom work.

### I can help with:

*   Custom **n8n nodes** for your service
    
*   Complex **n8n automations**
    
*   NocoDB integrations (advanced relations, custom logic, performance tuning)
    
*   API integrations (internal or external services)
    
*   Workflow optimization & architecture consulting

Whether it’s a **small tweak** or a **full-blown custom integration**, feel free to reach out.

Email: seo.orchid.kid@gmail.com
Telegram: https://t.me/xcharlesbronsonx
