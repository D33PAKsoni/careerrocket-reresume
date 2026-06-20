import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  LevelFormat,
  BorderStyle,
} from "docx";
import type { ShapedResumeData } from "./shapeResumeData";
import type { CoverLetterContent, Profile, ResumeTemplate } from "@/types/profile";

const PAGE = {
  size: { width: 12240, height: 15840 },
  margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
};

const NUMBERING_CONFIG = {
  config: [
    {
      reference: "resume-bullets",
      levels: [
        {
          level: 0,
          format: LevelFormat.BULLET,
          text: "•",
          alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 360, hanging: 270 } } },
        },
      ],
    },
  ],
};

function bulletParagraph(text: string): Paragraph {
  return new Paragraph({
    numbering: { reference: "resume-bullets", level: 0 },
    children: [new TextRun({ text, size: 20 })],
    spacing: { after: 40 },
  });
}

function sectionHeading(text: string, accentColor: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text: text.toUpperCase(), bold: true, size: 18, color: accentColor })],
    spacing: { before: 200, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD", space: 2 } },
  });
}


export function buildResumeDocx(data: ShapedResumeData, template: ResumeTemplate): Document {
  const accentColor = template === "modern" ? "6C63FF" : template === "minimal" ? "9CA3AF" : "555555";
  const headerAlign = template === "classic" ? AlignmentType.CENTER : AlignmentType.LEFT;

  const children: Paragraph[] = [
    new Paragraph({
      alignment: headerAlign,
      children: [new TextRun({ text: data.fullName, bold: true, size: 32 })],
      spacing: { after: 40 },
    }),
  ];

  if (data.headline) {
    children.push(
      new Paragraph({
        alignment: headerAlign,
        children: [new TextRun({ text: data.headline, size: 22, color: "555555" })],
        spacing: { after: 40 },
      })
    );
  }

  if (data.contactLine) {
    children.push(
      new Paragraph({
        alignment: headerAlign,
        children: [new TextRun({ text: data.contactLine, size: 18, color: "777777" })],
        spacing: { after: 200 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD", space: 4 } },
      })
    );
  }

  if (data.summary) {
    children.push(sectionHeading("Summary", accentColor));
    children.push(new Paragraph({ children: [new TextRun({ text: data.summary, size: 20 })], spacing: { after: 100 } }));
  }

  if (data.education.length > 0) {
    children.push(sectionHeading("Education", accentColor));
    data.education.forEach((edu) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: edu.institution, bold: true, size: 20 }),
            new TextRun({ text: edu.years ? `   ${edu.years}` : "", size: 18, color: "777777" }),
          ],
          spacing: { after: 20 },
        })
      );
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `${edu.degreeAndField}${edu.grade ? ` · ${edu.grade}` : ""}`, size: 18, color: "555555" })],
          spacing: { after: 100 },
        })
      );
    });
  }

  if (data.experience.length > 0) {
    children.push(sectionHeading("Experience", accentColor));
    data.experience.forEach((exp) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.role, bold: true, size: 20 }),
            new TextRun({ text: exp.dateRange ? `   ${exp.dateRange}` : "", size: 18, color: "777777" }),
          ],
          spacing: { after: 20 },
        })
      );
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${exp.organisation}${exp.location ? ` · ${exp.location}` : ""}`,
              size: 18,
              color: "555555",
            }),
          ],
          spacing: { after: 60 },
        })
      );
      if (exp.bullets.length > 0) {
        exp.bullets.forEach((b) => children.push(bulletParagraph(b)));
      } else if (exp.description) {
        children.push(new Paragraph({ children: [new TextRun({ text: exp.description, size: 20 })], spacing: { after: 60 } }));
      }
    });
  }

  if (data.projects.length > 0) {
    children.push(sectionHeading("Projects", accentColor));
    data.projects.forEach((proj) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: proj.title, bold: true, size: 20 }),
            new TextRun({ text: proj.techStack ? ` — ${proj.techStack}` : "", size: 18, color: "777777" }),
          ],
          spacing: { after: 40 },
        })
      );
      if (proj.bullets.length > 0) {
        proj.bullets.forEach((b) => children.push(bulletParagraph(b)));
      } else if (proj.description) {
        children.push(new Paragraph({ children: [new TextRun({ text: proj.description, size: 20 })], spacing: { after: 60 } }));
      }
    });
  }

  if (data.skillsByCategory.length > 0) {
    children.push(sectionHeading("Skills", accentColor));
    data.skillsByCategory.forEach(({ category, names }) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${category}: `, bold: true, size: 20 }),
            new TextRun({ text: names.join(", "), size: 20 }),
          ],
          spacing: { after: 40 },
        })
      );
    });
  }

  if (data.certifications.length > 0) {
    children.push(sectionHeading("Certifications", accentColor));
    data.certifications.forEach((cert) => {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: `${cert.title}${cert.issuer ? ` — ${cert.issuer}` : ""}`, size: 20 })],
          spacing: { after: 40 },
        })
      );
    });
  }

  return new Document({
    numbering: NUMBERING_CONFIG,
    styles: { default: { document: { run: { font: "Arial" } } } },
    sections: [{ properties: { page: PAGE }, children }],
  });
}

export function buildCoverLetterDocx(profile: Profile | null, content: CoverLetterContent | null): Document {
  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const children: Paragraph[] = [
    new Paragraph({ children: [new TextRun({ text: profile?.full_name ?? "", bold: true, size: 22 })], spacing: { after: 20 } }),
  ];

  if (profile?.location) children.push(new Paragraph({ children: [new TextRun({ text: profile.location, size: 20, color: "555555" })], spacing: { after: 20 } }));
  if (profile?.phone) children.push(new Paragraph({ children: [new TextRun({ text: profile.phone, size: 20, color: "555555" })], spacing: { after: 20 } }));
  if (profile?.linkedin_url) children.push(new Paragraph({ children: [new TextRun({ text: profile.linkedin_url, size: 20, color: "555555" })], spacing: { after: 200 } }));

  children.push(new Paragraph({ children: [new TextRun({ text: today, size: 20, color: "555555" })], spacing: { after: 200 } }));

  children.push(
    new Paragraph({
      children: [new TextRun({ text: content?.companyName ? `Hiring Team, ${content.companyName}` : "Hiring Team", size: 20 })],
      spacing: { after: 20 },
    })
  );
  if (content?.roleName) {
    children.push(
      new Paragraph({ children: [new TextRun({ text: `Re: ${content.roleName} application`, size: 18, color: "555555" })], spacing: { after: 200 } })
    );
  }

  [content?.hook, content?.evidence, content?.close].forEach((paragraph) => {
    if (paragraph) {
      children.push(new Paragraph({ children: [new TextRun({ text: paragraph, size: 20 })], spacing: { after: 160 } }));
    }
  });

  children.push(new Paragraph({ children: [new TextRun({ text: "Sincerely,", size: 20 })], spacing: { before: 100, after: 20 } }));
  children.push(new Paragraph({ children: [new TextRun({ text: profile?.full_name ?? "", size: 20 })] }));

  return new Document({
    styles: { default: { document: { run: { font: "Arial" } } } },
    sections: [{ properties: { page: PAGE }, children }],
  });
}
