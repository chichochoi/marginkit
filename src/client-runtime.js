(function () {
  "use strict";

  function formatMetric(value, format) {
    var num = Number(value);
    if (!Number.isFinite(num)) return "0";
    if (format === "currency") {
      var absFormatted = Math.abs(num).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      return num < 0 ? "-$" + absFormatted : "$" + absFormatted;
    }
    if (format === "percent") {
      return (
        num.toLocaleString("en-US", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 2
        }) + "%"
      );
    }
    return num.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }

  function initCalculator() {
    var root = document.getElementById("mk-calc-root");
    if (!root || typeof window.__MK_COMPUTE__ !== "function" || !Array.isArray(window.__MK_INPUTS__)) {
      return;
    }

    var inputsMeta = window.__MK_INPUTS__;
    var form = document.getElementById("mk-calc-form");
    var kpiContainer = document.getElementById("mk-kpi-grid");
    var verdictBox = document.getElementById("mk-verdict-box");
    var stackedBar = document.getElementById("mk-stacked-bar");
    var breakdownBody = document.getElementById("mk-breakdown-body");
    var copyBtn = document.getElementById("mk-copy-link");
    var resetBtn = document.getElementById("mk-reset-btn");

    function applyQueryParams() {
      var params = new URLSearchParams(window.location.search);
      inputsMeta.forEach(function (item) {
        if (!params.has(item.id)) return;
        var raw = params.get(item.id);
        var el = form.elements[item.id];
        if (!el) return;
        if (item.type === "checkbox") {
          el.checked = raw === "1" || raw === "true";
        } else if (item.type === "select") {
          var valid = (item.options || []).some(function (opt) {
            return String(opt.value) === raw;
          });
          if (valid) el.value = raw;
        } else {
          var parsed = Number(raw);
          if (Number.isFinite(parsed)) el.value = String(parsed);
        }
      });
    }

    function readValues() {
      var values = {};
      inputsMeta.forEach(function (item) {
        var el = form.elements[item.id];
        if (!el) {
          values[item.id] = item.defaultValue;
          return;
        }
        if (item.type === "checkbox") {
          values[item.id] = Boolean(el.checked);
        } else if (item.type === "select") {
          values[item.id] = el.value;
        } else {
          var parsed = Number(el.value);
          values[item.id] = Number.isFinite(parsed) ? parsed : 0;
        }
      });
      return values;
    }

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function render() {
      var values = readValues();
      var res = window.__MK_COMPUTE__(values);

      if (kpiContainer && Array.isArray(res.kpis)) {
        kpiContainer.innerHTML = res.kpis
          .map(function (kpi) {
            return (
              '<div class="kpi-card' +
              (kpi.highlight ? " highlight" : "") +
              '">' +
              '<div class="kpi-label">' +
              escapeHtml(kpi.label) +
              "</div>" +
              '<div class="kpi-value">' +
              escapeHtml(formatMetric(kpi.value, kpi.format)) +
              "</div>" +
              "</div>"
            );
          })
          .join("");
      }

      if (verdictBox && res.verdict) {
        var tone = res.verdict.tone || "good";
        verdictBox.className = "verdict-box verdict-" + escapeHtml(tone);
        verdictBox.innerHTML =
          '<div class="verdict-title">' +
          escapeHtml(res.verdict.title) +
          "</div>" +
          '<div class="verdict-detail">' +
          escapeHtml(res.verdict.detail) +
          "</div>";
      }

      var rows = Array.isArray(res.breakdown) ? res.breakdown : [];
      var totalShare = rows.reduce(function (sum, row) {
        return sum + Math.max(0, Number(row.share) || 0);
      }, 0);

      if (stackedBar) {
        stackedBar.innerHTML = rows
          .map(function (row) {
            var share = Math.max(0, Number(row.share) || 0);
            var pct = totalShare > 0 ? (share / totalShare) * 100 : 0;
            var key = escapeHtml(row.colorKey || "cost");
            return (
              '<div class="seg seg-' +
              key +
              '" style="width:' +
              pct.toFixed(2) +
              '%" title="' +
              escapeHtml(row.label) +
              ": " +
              share.toFixed(1) +
              '%"></div>'
            );
          })
          .join("");
      }

      if (breakdownBody) {
        breakdownBody.innerHTML = rows
          .map(function (row) {
            var key = escapeHtml(row.colorKey || "cost");
            return (
              "<tr>" +
              '<td><span class="dot seg-' +
              key +
              '"></span>' +
              escapeHtml(row.label) +
              "</td>" +
              '<td class="num">' +
              escapeHtml(formatMetric(row.amount, "currency")) +
              "</td>" +
              '<td class="num">' +
              escapeHtml(formatMetric(row.share, "percent")) +
              "</td>" +
              "</tr>"
            );
          })
          .join("");
      }
    }

    applyQueryParams();
    render();

    form.addEventListener("input", render);
    form.addEventListener("change", render);

    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var values = readValues();
        var params = new URLSearchParams();
        inputsMeta.forEach(function (item) {
          var v = values[item.id];
          if (item.type === "checkbox") {
            params.set(item.id, v ? "1" : "0");
          } else {
            params.set(item.id, String(v));
          }
        });
        var nextUrl = window.location.pathname + "?" + params.toString();
        window.history.replaceState(null, "", nextUrl);
        var fullUrl = window.location.href;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(fullUrl).then(
            function () {
              copyBtn.textContent = "Copied Shareable Link!";
              setTimeout(function () {
                copyBtn.textContent = "Copy Shareable Link";
              }, 1800);
            },
            function () {
              copyBtn.textContent = "URL Updated";
            }
          );
        }
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        inputsMeta.forEach(function (item) {
          var el = form.elements[item.id];
          if (!el) return;
          if (item.type === "checkbox") {
            el.checked = Boolean(item.defaultValue);
          } else {
            el.value = String(item.defaultValue);
          }
        });
        window.history.replaceState(null, "", window.location.pathname);
        render();
      });
    }
  }

  function initDirectory() {
    var searchInput = document.getElementById("mk-directory-search");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".mk-tool-card"));
    if (!searchInput || !cards.length) return;

    var pills = Array.prototype.slice.call(document.querySelectorAll(".mk-cat-pill"));
    var emptyState = document.getElementById("mk-empty-state");
    var activeCategory = "all";

    function filterCards() {
      var q = searchInput.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var cat = card.getAttribute("data-category") || "";
        var hay = (card.getAttribute("data-search") || "").toLowerCase();
        var matchCat = activeCategory === "all" || cat === activeCategory;
        var matchSearch = !q || hay.indexOf(q) !== -1;
        var show = matchCat && matchSearch;
        card.style.display = show ? "" : "none";
        if (show) visible += 1;
      });
      if (emptyState) {
        emptyState.style.display = visible === 0 ? "block" : "none";
      }
    }

    searchInput.addEventListener("input", filterCards);
    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        activeCategory = pill.getAttribute("data-category") || "all";
        pills.forEach(function (p) {
          p.classList.toggle("active", p === pill);
        });
        filterCards();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initCalculator();
    initDirectory();
  });
})();
