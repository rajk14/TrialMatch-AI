import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ClinicalTrials.gov API proxy
  app.post("/api/search-trials", async (req, res) => {
    try {
      const { condition, symptoms, age, sex, location, optimizedCond } = req.body;
      
      // Build query for ClinicalTrials.gov API v2
      const queryParams: any = {
        "query.cond": optimizedCond || condition,
        "filter.overallStatus": "RECRUITING",
        "pageSize": 10
      };

      if (location) {
        // Correct parameter for v2 is query.locn
        queryParams["query.locn"] = location;
      }

      const response = await axios.get("https://clinicaltrials.gov/api/v2/studies", {
        params: queryParams
      });

      const studies = response.data.studies || [];
      
      // Simplify studies for AI analysis
      const simplifiedStudies = studies.map((s: any) => {
        const study = s.protocolSection;
        return {
          nctId: study.identificationModule.nctId,
          title: study.identificationModule.briefTitle,
          status: study.statusModule.overallStatus,
          phase: study.designModule?.phases?.join(", ") || "N/A",
          summary: study.descriptionModule?.briefSummary,
          eligibility: study.eligibilityModule?.eligibilityCriteria,
          sponsor: study.sponsorCollaboratorsModule?.leadSponsor?.name,
          locations: study.contactsLocationsModule?.locations?.map((l: any) => ({
            facility: l.facility,
            city: l.city,
            state: l.state,
            country: l.country
          }))
        };
      });

      res.json({ trials: simplifiedStudies });
    } catch (error: any) {
      console.error("Search error details:", error?.response?.data || error.message);
      res.status(500).json({ error: "Failed to search trials", details: error?.response?.data || error.message });
    }
  });

  app.get("/api/trial/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const response = await axios.get(`https://clinicaltrials.gov/api/v2/studies/${id}`);
      
      const study = response.data.protocolSection;
      const simplifiedTrial = {
        nctId: study.identificationModule.nctId,
        title: study.identificationModule.briefTitle,
        status: study.statusModule.overallStatus,
        phase: study.designModule?.phases?.join(", ") || "N/A",
        summary: study.descriptionModule?.briefSummary,
        eligibility: study.eligibilityModule?.eligibilityCriteria,
        sponsor: study.sponsorCollaboratorsModule?.leadSponsor?.name,
        locations: study.contactsLocationsModule?.locations?.map((l: any) => ({
          facility: l.facility,
          city: l.city,
          state: l.state,
          country: l.country
        }))
      };

      res.json({ trial: simplifiedTrial });
    } catch (error: any) {
      console.error("Trial lookup error:", error?.response?.data || error.message);
      res.status(500).json({ error: "Failed to fetch trial details" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
