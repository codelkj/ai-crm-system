# Storage Directory

This directory contains uploaded files and temporary processing files.

## Structure

- `legal-documents/` - PDF files for legal document processing
- `csv-uploads/` - Bank CSV files for financial analysis
- `temp/` - Temporary files during processing

## Security Notes

- All files in this directory are excluded from git (see .gitignore)
- Ensure proper file permissions in production
- Implement virus scanning for uploaded files
- Set maximum file size limits (configured in backend)

## Backup

Regular backups of this directory are recommended for production environments.
