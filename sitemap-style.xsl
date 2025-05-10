<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="html" encoding="UTF-8" indent="yes" />
    <xsl:template match="/">
        <html>
            <head>
                <title>Website Sitemap</title>
                <style>
                    body {
                    font-family: Arial, sans-serif;
                    background-color: #f9f9f9;
                    color: #333;
                    margin: 20px;
                    }
                    h1 {
                    color: #0056b3;
                    border-bottom: 2px solid #0056b3;
                    padding-bottom: 10px;
                    }
                    table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                    }
                    th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                    }
                    th {
                    background-color: #0056b3;
                    color: #fff;
                    }
                    tr:nth-child(even) {
                    background-color: #f2f2f2;
                    }
                    a {
                    color: #0056b3;
                    text-decoration: none;
                    }
                    a:hover {
                    text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <h1>Website Sitemap</h1>
                <table>
                    <tr>
                        <th>URL</th>
                        <th>Last Modified</th>
                        <th>Change Frequency</th>
                        <th>Priority</th>
                    </tr>
                    <xsl:for-each select="urlset/url">
                        <tr>
                            <td><a href="{loc}"><xsl:value-of select="loc"/></a></td>
                            <td><xsl:value-of select="lastmod"/></td>
                            <td><xsl:value-of select="changefreq"/></td>
                            <td><xsl:value-of select="priority"/></td>
                        </tr>
                    </xsl:for-each>
                </table>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>
