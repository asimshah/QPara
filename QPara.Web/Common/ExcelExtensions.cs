using Fastnet.Core;
using Fastnet.QPara.Data;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Fastnet.QPara
{
    public static class ExcelExtensions
    {
        private static string FormatAddress(string fullAddress)
        {
            return fullAddress.Trim().Replace("\r", ", ");
        }
        public static void CreateSheetToFile(this IEnumerable<Member> memberList,
            QParaOptions options,
            string sheetName,
            string[] titleLines,
            ColumnMetadata[] columnList, string filename)
        {
            var fi = new FileInfo(filename);
            if (!fi.Directory.Exists)
            {
                fi.Directory.Create();
            }
            foreach (var file in fi.Directory.EnumerateFiles())
            {
                file.Delete();
            }
            using (var stream = File.Create(fi.FullName))
            {
                CreateSheet(stream, options, memberList, sheetName, titleLines, columnList);
            }
        }
        public static MemoryStream CreateSheetToMemoryStream(this IEnumerable<Member> memberList,
            QParaOptions options,
            string sheetName,
            string[] titleLines,
            ColumnMetadata[] columnList)
        {
            MemoryStream ms = new MemoryStream();
            CreateSheet(ms, options, memberList, sheetName, titleLines, columnList);
            ms.Seek(0, SeekOrigin.Begin);
            return ms;
        }
        public static MemoryStream CreateStreetRepSheetToMemoryStream(this IEnumerable<StreetRep> list,
            string sheetName,
            string[] titleLines)
        {
            MemoryStream ms = new MemoryStream();
            CreateStreetRepSheet(ms, list, sheetName, titleLines);
            ms.Seek(0, SeekOrigin.Begin);
            return ms;
        }
        private static void CreateStreetRepSheet(Stream stream, IEnumerable<StreetRep> list, string sheetName,
            string[] titlelines)
        {
            string buildAddress(Member m)
            {
                StringBuilder sb = new StringBuilder();
                //if (!string.IsNullOrWhiteSpace(m.Flat))
                //{
                //    sb.Append(m.Flat + "\r\n");
                //}
                if (!string.IsNullOrWhiteSpace(m.Address))
                {
                    //string[] parts = m.Address.Split("\n");
                    //parts = parts.Where(x => !string.IsNullOrWhiteSpace(x)).ToArray();
                    //var temp = string.Join("\r\n", parts);
                    sb.Append(m.Address);
                }
                if (!string.IsNullOrWhiteSpace(m.PostCode))
                {
                    sb.Append(" " + m.PostCode);
                }
                return sb.ToString();
            }
            //var ukTime = TimeZoneInfo.FindSystemTimeZoneById("GMT Standard Time");
            int sr = 1, sc = 1;
            int r = 0;
            int c = 0;
            using (var package = new ExcelPackage(stream))
            {
                var qparaPink = Color.FromArgb(255, 127, 10, 73);
                var workSheet = package.Workbook.Worksheets.Add(sheetName);
                workSheet.Cells.Style.Font.Size = 10;
                r = sr; c = sc;
                int index = 0;
                foreach (string line in titlelines)
                {
                    if (index == 0)
                    {
                        workSheet.Cells[r, c].Style.Font.Bold = true;
                        workSheet.Cells[r, c].Style.Font.Size = 12;
                    }

                    workSheet.Cells[r, c].Value = line;
                    ++r;
                    ++index;
                }
                ++r;
                //workSheet.Row(r).Style.Font.Bold = true;
                //workSheet.Row(r).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                foreach (var rep in list.OrderBy(x => x.Zone.Number))
                {
                    c = sc;

                    var r1 = r;
                    var r2 = r + 1;
                    workSheet.Cells[r1, c].Value = $"Zone {rep.Zone.Number}";
                    workSheet.Cells[r1, c].Style.Font.Bold = true;
                    c++;
                    workSheet.Cells[r1, c].Value = $"{rep.Member.FirstName} {rep.Member.LastName}";
                    c++;
                    if (string.IsNullOrWhiteSpace(rep.Member.Flat))
                    {
                        workSheet.Cells[r1, c].Value = $"{buildAddress(rep.Member)}";
                    }
                    else
                    {
                        workSheet.Cells[r1, c].Value = $"{rep.Member.Flat}";
                    }
                    c++;
                    workSheet.Cells[r1, c].Value = $"{rep.Member.MobileNumber}";
                    c = sc;
                    workSheet.Cells[r2, c].Value = $"{rep.Zone.Description}";
                    workSheet.Cells[r2, c].Style.VerticalAlignment = ExcelVerticalAlignment.Top;
                    workSheet.Cells[r2, c].Style.WrapText = true;
                    workSheet.Cells[r2, c].Style.Font.Italic = true;
                    c++;
                    workSheet.Cells[r2, c].Value = $"{rep.Member.Email}";
                    workSheet.Cells[r2, c].Style.VerticalAlignment = ExcelVerticalAlignment.Top;
                    workSheet.Cells[r2, c].Style.Font.Italic = true;
                    c++;
                    if (!string.IsNullOrWhiteSpace(rep.Member.Flat))
                    {
                        workSheet.Cells[r2, c].Value = $"{buildAddress(rep.Member)}";
                    }
                    workSheet.Cells[r2, c].Style.VerticalAlignment = ExcelVerticalAlignment.Top;
                    c++;
                    workSheet.Cells[r2, c].Value = $"{rep.Member.PhoneNumber}";
                    //workSheet.Cells[r2, c].Style.VerticalAlignment = ExcelVerticalAlignment.Top;
                    //
                    //workSheet.Cells[r1, sc, r2, sc + 1].Style.Border.BorderAround(ExcelBorderStyle.Thin);
                    //workSheet.Cells[r1, sc + 1, r2, sc + 2].Style.Border.BorderAround(ExcelBorderStyle.Thin);
                    //workSheet.Cells[r1, sc + 2, r2, sc + 3].Style.Border.BorderAround(ExcelBorderStyle.Thin);
                    //workSheet.Cells[r1, sc + 3, r2, sc + 4].Style.Border.BorderAround(ExcelBorderStyle.Thin);

                    workSheet.Cells[r1, sc , r2, sc + 4].Style.Border.BorderAround(ExcelBorderStyle.Thin);
                    //
                    r += 2;
                }
                workSheet.Column(sc).Width = 32;
                workSheet.Column(sc + 1).Width = 28;
                workSheet.Column(sc + 2).Width = 32;
                workSheet.Column(sc + 3).Width = 16;
                workSheet.Column(sc + 3).Style.VerticalAlignment = ExcelVerticalAlignment.Top;

                workSheet.PrinterSettings.Orientation = eOrientation.Portrait;
                workSheet.PrinterSettings.HorizontalCentered = true;
                workSheet.PrinterSettings.TopMargin = 0;
                workSheet.PrinterSettings.BottomMargin = 0;
                workSheet.PrinterSettings.LeftMargin = 0;
                workSheet.PrinterSettings.RightMargin = 0;
                workSheet.PrinterSettings.HeaderMargin = 0;
                workSheet.PrinterSettings.FooterMargin = 0;
                workSheet.PrinterSettings.ShowGridLines = false;
                workSheet.PrinterSettings.FitToPage = true;
                //workSheet.PrinterSettings.RepeatRows = new ExcelAddress("1:3");
                package.Save();
            }
        }
        private static void CreateSheet(Stream stream, QParaOptions options, IEnumerable<Member> memberList,
            string sheetName,
            string[] titlelines,
            ColumnMetadata[] columnList)
        {
            var requiredColumns = columnList.Where(x => x.Show);
            var ukTime = TimeZoneInfo.FindSystemTimeZoneById("GMT Standard Time");
            int sr = 1, sc = 1;
            int r = 0;
            int c = 0;
            //MemoryStream ms = new MemoryStream();
            using (var package = new ExcelPackage(stream))
            {
                var qparaPink = Color.FromArgb(255, 127, 10, 73);
                var workSheet = package.Workbook.Worksheets.Add(sheetName);

                workSheet.Cells.Style.Font.Size = 10;
                r = sr; c = sc;
                int index = 0;
                foreach (string line in titlelines)
                {
                    if (index == 0)
                    {
                        workSheet.Cells[r, c].Style.Font.Bold = true;
                        workSheet.Cells[r, c].Style.Font.Size = 12;
                    }

                    workSheet.Cells[r, c].Value = line;
                    ++r;
                    ++index;
                }
                ++r; c = sc;

                workSheet.Row(r).Style.Font.Bold = true;
                workSheet.Row(r).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                //workSheet.Row(r).Style.WrapText = true;
                foreach (var column in requiredColumns)
                {
                    switch (column.Name)
                    {
                        case Names.FirstName:
                        case Names.LastName:
                            workSheet.Column(c).Width = 21;
                            break;
                        case Names.Name:
                            workSheet.Column(c).Width = 28;
                            break;
                        case Names.Address:
                            workSheet.Column(c).Width = 24;
                            break;
                        case Names.Email:
                            workSheet.Column(c).Width = 32;
                            //workSheet.Column(c).Style.WrapText = true;
                            break;
                        case Names.PhoneNumber:
                        case Names.MobileNumber:
                            workSheet.Column(c).Width = 14;
                            break;
                        case Names.MemberCount:
                        case Names.ZoneNumber:
                        case Names.AmountDue:
                        case Names.AmountReceived:
                            workSheet.Column(c).Width = 8;
                            workSheet.Column(c).Style.HorizontalAlignment = ExcelHorizontalAlignment.Right;
                            break;
                        case Names.PaymentMethod:
                        case Names.IsPaid:
                        case Names.IsSuspended:
                        case Names.PaymentIsOutstanding:
                        case Names.HasEmail:
                            workSheet.Column(c).Width = 8;
                            workSheet.Column(c).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                            break;
                        case Names.SubscriptionPeriod:
                        case Names.SubscriptionType:

                        case Names.MinutesDeliveryMethod:
                        case Names.LeavingReason:
                            workSheet.Column(c).Width = 15;
                            workSheet.Column(c).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                            break;
                    }
                    workSheet.Column(c).Style.VerticalAlignment = ExcelVerticalAlignment.Top;
                    workSheet.Cells[r, c].Style.WrapText = true;
                    //workSheet.Cells[r, c].Style.VerticalAlignment = ExcelVerticalAlignment.Top;
                    workSheet.Cells[r, c].Style.Font.Color.SetColor(Color.White);
                    workSheet.Cells[r, c].Style.Fill.PatternType = ExcelFillStyle.Solid;
                    workSheet.Cells[r, c].Style.Fill.BackgroundColor.SetColor(qparaPink);
                    workSheet.Cells[r, c].Value = column.Name.ToDescription();
                    ++c;
                }
                foreach (var m in memberList)
                {
                    c = sc;
                    ++r;
                    foreach (var column in requiredColumns)
                    {
                        dynamic datum = default;
                        switch (column.Name)
                        {
                            case Names.Name:
                                datum = m.Name;
                                workSheet.Cells[r, c].Style.WrapText = true;
                                break;
                            case Names.FirstName:
                                datum = m.FirstName;
                                break;
                            case Names.LastName:
                                datum = m.LastName;
                                break;
                            case Names.Email:
                                datum = string.Join(" ", m.GetEmailAddresses());
                                workSheet.Cells[r, c].Style.WrapText = true;
                                break;
                            case Names.HasEmail:
                                //datum = string.IsNullOrWhiteSpace(m.Email) ? "" : "Y";
                                datum = m.GetEmailAddresses().Count() > 0 ? "" : "Y";
                                break;
                            case Names.Address:
                                datum = m.FullAddress.Trim();// FormatAddress(m.FullAddress);
                                workSheet.Cells[r, c].Style.WrapText = true;
                                break;
                            case Names.PostCode:
                                datum = m.PostCode;
                                break;
                            case Names.PhoneNumber:
                                datum = m.PhoneNumber;
                                break;
                            case Names.MobileNumber:
                                datum = m.MobileNumber;
                                break;
                            case Names.MemberCount:
                                if (m.MemberCount > 1)
                                {
                                    datum = m.MemberCount;//.ToString();
                                }
                                break;
                            case Names.ZoneNumber:
                                datum = m.ZoneNumber;//.ToString();
                                break;
                            case Names.JoinedOn:
                                datum = m.JoinedOn.HasValue ? TimeZoneInfo.ConvertTime(m.JoinedOn.Value, ukTime).ToDefault() : "";
                                break;
                            case Names.SubscriptionType:
                                if (m.SubscriptionType != SubscriptionType.Standard)
                                {
                                    datum = m.SubscriptionType.ToDescription();
                                }
                                break;
                            case Names.SubscriptionPeriod:
                                if (m.SubscriptionPeriod == SubscriptionPeriod.Life)
                                {
                                    datum = m.SubscriptionPeriod.ToDescription();
                                }
                                break;
                            case Names.PaymentMethod:
                                if (m.PaymentMethod == PaymentMethod.Regular)
                                {
                                    datum = m.PaymentMethod.ToDescription();
                                }
                                break;
                            case Names.MinutesDeliveryMethod:
                                datum = m.MinutesDeliveryMethod.ToDescription();
                                break;
                            case Names.DeliveryNote:
                                datum = m.DeliveryNote;
                                break;
                            case Names.IsSuspended:
                                datum = m.IsSuspended ? "Y" : "";
                                break;
                            case Names.HasLeft:
                                datum = m.HasLeft ? "Y" : "";
                                break;
                            case Names.LeftOn:
                                datum = m.LeftOn.HasValue ? TimeZoneInfo.ConvertTime(m.LeftOn.Value, ukTime).ToDefault() : "";
                                break;
                            case Names.LeavingReason:
                                datum = m.LeavingReason.ToDescription();
                                break;
                            case Names.MonthDue:
                                datum = m.MonthDue.ToMonthName();
                                break;
                            case Names.AmountDue:
                                if (m.ShouldMakePayments())
                                {
                                    datum = m.AmountDue;
                                    workSheet.Cells[r, c].Style.Numberformat.Format = "£0";
                                }
                                break;
                            case Names.AmountReceived:
                                if (m.ShouldMakePayments())
                                {
                                    datum = m.AmountReceived;
                                    workSheet.Cells[r, c].Style.Numberformat.Format = "£0";
                                }
                                break;

                            case Names.IsPaid:
                                if (m.ShouldMakePayments())
                                {
                                    //datum = m.IsPaid ? "Y" : "";
                                    datum = m.GetIsPaid(options) ? "Y" : "";
                                }
                                break;
                            case Names.PaymentIsOutstanding:
                                if (m.ShouldMakePayments())
                                {
                                    datum = m.PaymentIsOutstanding ? "Y" : "";
                                }
                                break;
                        }
                        workSheet.Cells[r, c].Value = datum;
                        ++c;
                    }
                }
                // cols are from 2 to columndata.length + 2
                // rows are from 5 to r
                //var sr = new ExcelAddress(5, 2, r, requiredColumns.Count() + 2);
                //workSheet.Select(sr);
                //workSheet.SelectedRange.AutoFitColumns();
                //Debug.WriteLine($"autofit columns from {2} to {c - 1}");
                //for(var i = 2; i < c;++i)
                //{
                //    workSheet.Column(i).AutoFit();
                //}
                workSheet.PrinterSettings.Orientation = eOrientation.Landscape;
                workSheet.PrinterSettings.HorizontalCentered = true;
                workSheet.PrinterSettings.TopMargin = 0;
                workSheet.PrinterSettings.BottomMargin = 0;
                workSheet.PrinterSettings.LeftMargin = 0;
                workSheet.PrinterSettings.RightMargin = 0;
                workSheet.PrinterSettings.HeaderMargin = 0;
                workSheet.PrinterSettings.FooterMargin = 0;
                workSheet.PrinterSettings.ShowGridLines = true;
                workSheet.PrinterSettings.FitToPage = true;
                workSheet.PrinterSettings.RepeatRows = new ExcelAddress("1:3");
                package.Save();
            }
            //return stream;
        }
    }
}
