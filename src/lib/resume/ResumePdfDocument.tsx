import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import type { ShapedResumeData } from "@/lib/resume/shapeResumeData";
import type { ResumeTemplate } from "@/types/profile";

// react-pdf's default font (Helvetica) has no bold/italic metrics issues
// for our use case, so we skip custom font registration — keeps the
// serverless function lighter and avoids font-loading edge cases.
Font.register({
  family: "Helvetica",
  fonts: [{ src: "Helvetica" }],
});

const classicStyles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1f2937" },
  header: { textAlign: "center", marginBottom: 16, paddingBottom: 12, borderBottom: "1pt solid #e5e7eb" },
  name: { fontSize: 20, fontWeight: 700, marginBottom: 2 },
  headline: { fontSize: 11, color: "#4b5563", marginBottom: 6 },
  contact: { fontSize: 8, color: "#6b7280" },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6b7280", marginBottom: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  bold: { fontWeight: 700 },
  muted: { color: "#6b7280", fontSize: 8 },
  body: { color: "#374151", marginBottom: 6 },
  bulletRow: { flexDirection: "row", marginBottom: 2, paddingLeft: 4 },
  bulletDot: { width: 10, fontSize: 9 },
  bulletText: { flex: 1, fontSize: 9.5, color: "#374151" },
  entry: { marginBottom: 8 },
});

function ClassicPdf({ data }: { data: ShapedResumeData }) {
  return (
    <Page size="LETTER" style={classicStyles.page}>
      <View style={classicStyles.header}>
        <Text style={classicStyles.name}>{data.fullName}</Text>
        {data.headline && <Text style={classicStyles.headline}>{data.headline}</Text>}
        {data.contactLine && <Text style={classicStyles.contact}>{data.contactLine}</Text>}
      </View>

      {data.summary && (
        <View style={classicStyles.section}>
          <Text style={classicStyles.sectionTitle}>Summary</Text>
          <Text style={classicStyles.body}>{data.summary}</Text>
        </View>
      )}

      {data.education.length > 0 && (
        <View style={classicStyles.section}>
          <Text style={classicStyles.sectionTitle}>Education</Text>
          {data.education.map((edu, i) => (
            <View key={i} style={classicStyles.entry}>
              <View style={classicStyles.row}>
                <Text style={classicStyles.bold}>{edu.institution}</Text>
                <Text style={classicStyles.muted}>{edu.years}</Text>
              </View>
              <Text style={classicStyles.muted}>{edu.degreeAndField}{edu.grade ? ` · ${edu.grade}` : ""}</Text>
            </View>
          ))}
        </View>
      )}

      {data.experience.length > 0 && (
        <View style={classicStyles.section}>
          <Text style={classicStyles.sectionTitle}>Experience</Text>
          {data.experience.map((exp) => (
            <View key={exp.id} style={classicStyles.entry}>
              <View style={classicStyles.row}>
                <Text style={classicStyles.bold}>{exp.role}</Text>
                <Text style={classicStyles.muted}>{exp.dateRange}</Text>
              </View>
              <Text style={classicStyles.muted}>{exp.organisation}{exp.location ? ` · ${exp.location}` : ""}</Text>
              {exp.bullets.length > 0
                ? exp.bullets.map((b, i) => (
                    <View key={i} style={classicStyles.bulletRow}>
                      <Text style={classicStyles.bulletDot}>•</Text>
                      <Text style={classicStyles.bulletText}>{b}</Text>
                    </View>
                  ))
                : exp.description && <Text style={classicStyles.body}>{exp.description}</Text>}
            </View>
          ))}
        </View>
      )}

      {data.projects.length > 0 && (
        <View style={classicStyles.section}>
          <Text style={classicStyles.sectionTitle}>Projects</Text>
          {data.projects.map((proj) => (
            <View key={proj.id} style={classicStyles.entry}>
              <Text style={classicStyles.bold}>
                {proj.title}{proj.techStack ? ` — ${proj.techStack}` : ""}
              </Text>
              {proj.bullets.length > 0
                ? proj.bullets.map((b, i) => (
                    <View key={i} style={classicStyles.bulletRow}>
                      <Text style={classicStyles.bulletDot}>•</Text>
                      <Text style={classicStyles.bulletText}>{b}</Text>
                    </View>
                  ))
                : proj.description && <Text style={classicStyles.body}>{proj.description}</Text>}
            </View>
          ))}
        </View>
      )}

      {data.skillsByCategory.length > 0 && (
        <View style={classicStyles.section}>
          <Text style={classicStyles.sectionTitle}>Skills</Text>
          {data.skillsByCategory.map(({ category, names }) => (
            <Text key={category} style={classicStyles.body}>
              <Text style={classicStyles.bold}>{category}: </Text>
              {names.join(", ")}
            </Text>
          ))}
        </View>
      )}

      {data.certifications.length > 0 && (
        <View style={classicStyles.section}>
          <Text style={classicStyles.sectionTitle}>Certifications</Text>
          {data.certifications.map((c, i) => (
            <Text key={i} style={classicStyles.body}>{c.title}{c.issuer ? ` — ${c.issuer}` : ""}</Text>
          ))}
        </View>
      )}
    </Page>
  );
}

const modernStyles = StyleSheet.create({
  page: { fontSize: 10, fontFamily: "Helvetica", color: "#1f2937" },
  headerBand: { backgroundColor: "#111827", padding: 28, paddingBottom: 20 },
  name: { fontSize: 20, fontWeight: 700, color: "#ffffff", marginBottom: 2 },
  headline: { fontSize: 11, color: "#d1d5db", marginBottom: 6 },
  contact: { fontSize: 8, color: "#9ca3af" },
  body: { padding: 28, paddingTop: 16 },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#6C63FF", marginBottom: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  bold: { fontWeight: 700 },
  muted: { color: "#6b7280", fontSize: 8 },
  bodyText: { color: "#374151", marginBottom: 6 },
  bulletRow: { flexDirection: "row", marginBottom: 2, paddingLeft: 6, borderLeft: "1.5pt solid #e5e7eb" },
  bulletDot: { width: 10, fontSize: 9 },
  bulletText: { flex: 1, fontSize: 9.5, color: "#374151" },
  entry: { marginBottom: 8, paddingLeft: 6, borderLeft: "1.5pt solid #e5e7eb" },
  twoCol: { flexDirection: "row", gap: 20 },
  col: { flex: 1 },
});

function ModernPdf({ data }: { data: ShapedResumeData }) {
  return (
    <Page size="LETTER" style={modernStyles.page}>
      <View style={modernStyles.headerBand}>
        <Text style={modernStyles.name}>{data.fullName}</Text>
        {data.headline && <Text style={modernStyles.headline}>{data.headline}</Text>}
        {data.contactLine && <Text style={modernStyles.contact}>{data.contactLine}</Text>}
      </View>

      <View style={modernStyles.body}>
        {data.summary && (
          <View style={modernStyles.section}>
            <Text style={modernStyles.sectionTitle}>Summary</Text>
            <Text style={modernStyles.bodyText}>{data.summary}</Text>
          </View>
        )}

        {data.experience.length > 0 && (
          <View style={modernStyles.section}>
            <Text style={modernStyles.sectionTitle}>Experience</Text>
            {data.experience.map((exp) => (
              <View key={exp.id} style={modernStyles.entry}>
                <View style={modernStyles.row}>
                  <Text style={modernStyles.bold}>{exp.role} @ {exp.organisation}</Text>
                  <Text style={modernStyles.muted}>{exp.dateRange}</Text>
                </View>
                {exp.bullets.length > 0
                  ? exp.bullets.map((b, i) => (
                      <View key={i} style={modernStyles.bulletRow}>
                        <Text style={modernStyles.bulletDot}>•</Text>
                        <Text style={modernStyles.bulletText}>{b}</Text>
                      </View>
                    ))
                  : exp.description && <Text style={modernStyles.bodyText}>{exp.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {data.projects.length > 0 && (
          <View style={modernStyles.section}>
            <Text style={modernStyles.sectionTitle}>Projects</Text>
            {data.projects.map((proj) => (
              <View key={proj.id} style={modernStyles.entry}>
                <Text style={modernStyles.bold}>{proj.title}{proj.techStack ? ` — ${proj.techStack}` : ""}</Text>
                {proj.bullets.length > 0
                  ? proj.bullets.map((b, i) => (
                      <View key={i} style={modernStyles.bulletRow}>
                        <Text style={modernStyles.bulletDot}>•</Text>
                        <Text style={modernStyles.bulletText}>{b}</Text>
                      </View>
                    ))
                  : proj.description && <Text style={modernStyles.bodyText}>{proj.description}</Text>}
              </View>
            ))}
          </View>
        )}

        <View style={modernStyles.twoCol}>
          {data.education.length > 0 && (
            <View style={modernStyles.col}>
              <Text style={modernStyles.sectionTitle}>Education</Text>
              {data.education.map((edu, i) => (
                <View key={i} style={{ marginBottom: 6 }}>
                  <Text style={[modernStyles.bold, { fontSize: 9 }]}>{edu.institution}</Text>
                  <Text style={modernStyles.muted}>{edu.degreeAndField}</Text>
                  <Text style={modernStyles.muted}>{edu.years}{edu.grade ? ` · ${edu.grade}` : ""}</Text>
                </View>
              ))}
            </View>
          )}
          {data.skillsByCategory.length > 0 && (
            <View style={modernStyles.col}>
              <Text style={modernStyles.sectionTitle}>Skills</Text>
              <Text style={[modernStyles.bodyText, { fontSize: 8.5 }]}>
                {data.skillsByCategory.flatMap((g) => g.names).join(", ")}
              </Text>
            </View>
          )}
        </View>

        {data.certifications.length > 0 && (
          <View style={[modernStyles.section, { marginTop: 10 }]}>
            <Text style={modernStyles.sectionTitle}>Certifications</Text>
            {data.certifications.map((c, i) => (
              <Text key={i} style={[modernStyles.bodyText, { fontSize: 8.5 }]}>{c.title}{c.issuer ? ` — ${c.issuer}` : ""}</Text>
            ))}
          </View>
        )}
      </View>
    </Page>
  );
}

const minimalStyles = StyleSheet.create({
  page: { padding: 48, fontSize: 10, fontFamily: "Helvetica", color: "#1f2937" },
  header: { marginBottom: 24 },
  name: { fontSize: 22, fontWeight: 300, marginBottom: 2 },
  headline: { fontSize: 11, color: "#6b7280", marginBottom: 8 },
  contact: { fontSize: 8, color: "#9ca3af" },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 8, fontWeight: 500, textTransform: "uppercase", letterSpacing: 2, color: "#9ca3af", marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  medium: { fontWeight: 500 },
  muted: { color: "#9ca3af", fontSize: 8 },
  bodyText: { color: "#374151" },
  entry: { marginBottom: 10 },
  italic: { fontStyle: "italic", color: "#4b5563" },
});

function MinimalPdf({ data }: { data: ShapedResumeData }) {
  return (
    <Page size="LETTER" style={minimalStyles.page}>
      <View style={minimalStyles.header}>
        <Text style={minimalStyles.name}>{data.fullName}</Text>
        {data.headline && <Text style={minimalStyles.headline}>{data.headline}</Text>}
        {data.contactLine && <Text style={minimalStyles.contact}>{data.contactLine}</Text>}
      </View>

      {data.summary && (
        <View style={minimalStyles.section}>
          <Text style={minimalStyles.italic}>{data.summary}</Text>
        </View>
      )}

      {data.experience.length > 0 && (
        <View style={minimalStyles.section}>
          <Text style={minimalStyles.sectionTitle}>Experience</Text>
          {data.experience.map((exp) => (
            <View key={exp.id} style={minimalStyles.entry}>
              <View style={minimalStyles.row}>
                <Text style={minimalStyles.medium}>{exp.role}</Text>
                <Text style={minimalStyles.muted}>{exp.dateRange}</Text>
              </View>
              <Text style={minimalStyles.muted}>{exp.organisation}{exp.location ? `, ${exp.location}` : ""}</Text>
              {exp.bullets.length > 0
                ? exp.bullets.map((b, i) => <Text key={i} style={minimalStyles.bodyText}>{b}</Text>)
                : exp.description && <Text style={minimalStyles.bodyText}>{exp.description}</Text>}
            </View>
          ))}
        </View>
      )}

      {data.projects.length > 0 && (
        <View style={minimalStyles.section}>
          <Text style={minimalStyles.sectionTitle}>Projects</Text>
          {data.projects.map((proj) => (
            <View key={proj.id} style={minimalStyles.entry}>
              <Text style={minimalStyles.medium}>{proj.title}{proj.techStack ? ` · ${proj.techStack}` : ""}</Text>
              {proj.bullets.length > 0
                ? proj.bullets.map((b, i) => <Text key={i} style={minimalStyles.bodyText}>{b}</Text>)
                : proj.description && <Text style={minimalStyles.bodyText}>{proj.description}</Text>}
            </View>
          ))}
        </View>
      )}

      {data.education.length > 0 && (
        <View style={minimalStyles.section}>
          <Text style={minimalStyles.sectionTitle}>Education</Text>
          {data.education.map((edu, i) => (
            <View key={i} style={minimalStyles.row}>
              <View>
                <Text style={minimalStyles.medium}>{edu.institution}</Text>
                <Text style={minimalStyles.muted}>{edu.degreeAndField}{edu.grade ? ` · ${edu.grade}` : ""}</Text>
              </View>
              <Text style={minimalStyles.muted}>{edu.years}</Text>
            </View>
          ))}
        </View>
      )}

      {data.skillsByCategory.length > 0 && (
        <View style={minimalStyles.section}>
          <Text style={minimalStyles.sectionTitle}>Skills</Text>
          <Text style={minimalStyles.bodyText}>{data.skillsByCategory.flatMap((g) => g.names).join(" · ")}</Text>
        </View>
      )}

      {data.certifications.length > 0 && (
        <View style={minimalStyles.section}>
          <Text style={minimalStyles.sectionTitle}>Certifications</Text>
          <Text style={minimalStyles.bodyText}>{data.certifications.map((c) => c.title).join(" · ")}</Text>
        </View>
      )}
    </Page>
  );
}

export function ResumePdfDocument({ data, template }: { data: ShapedResumeData; template: ResumeTemplate }) {
  return (
    <Document>
      {template === "modern" ? <ModernPdf data={data} /> : template === "minimal" ? <MinimalPdf data={data} /> : <ClassicPdf data={data} />}
    </Document>
  );
}
