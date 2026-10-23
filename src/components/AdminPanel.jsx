import { useState } from "react";

const WATCHES_API_URL = "http://localhost:5000/api/watches";

export default function AdminPanel({ watches, setWatches, onClose }) {
  const [editingId, setEditingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    color: "",
    price: "",
    image: "",
  });

  const resetForm = () => {
    setForm({
      name: "",
      color: "",
      price: "",
      image: "",
    });

    setError("");
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setForm((current) => ({
        ...current,
        image: reader.result,
      }));

      setError("");
    };

    reader.readAsDataURL(file);
  };

  const startAdd = () => {
    setEditingId(null);
    setIsAdding(true);
    setError("");

    setForm({
      name: "",
      color: "",
      price: "",
      image: "",
    });
  };

  const startEdit = (watch) => {
    const watchId = watch._id || watch.id;

    setIsAdding(false);
    setEditingId(watchId);
    setError("");

    setForm({
      name: watch.name || "",
      color: watch.color || "",
      price: watch.price || "",
      image: watch.image || "",
    });
  };

  const cancelForm = () => {
    setEditingId(null);
    setIsAdding(false);
    resetForm();
  };

  const saveNewWatch = async () => {
    if (
      !form.name.trim() ||
      !form.color.trim() ||
      !form.price.trim()
    ) {
      setError("Name, color and price are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(WATCHES_API_URL, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          color: form.color.trim(),
          price: form.price.trim(),
          image: form.image || "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to add watch."
        );
      }

      if (data.watch) {
        setWatches((current) => [
          data.watch,
          ...current,
        ]);
      }

      setIsAdding(false);
      resetForm();
    } catch (error) {
      console.error("Add watch error:", error);

      setError(
        error.message ||
          "Something went wrong while adding the watch."
      );
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async () => {
    if (
      !form.name.trim() ||
      !form.color.trim() ||
      !form.price.trim()
    ) {
      setError("Name, color and price are required.");
      return;
    }

    if (!editingId) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `${WATCHES_API_URL}/${editingId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            color: form.color.trim(),
            price: form.price.trim(),
            image: form.image || "",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to update watch."
        );
      }

      if (data.watch) {
        setWatches((current) =>
          current.map((watch) => {
            const watchId = watch._id || watch.id;

            return watchId === editingId
              ? data.watch
              : watch;
          })
        );
      }

      setEditingId(null);
      resetForm();
    } catch (error) {
      console.error("Update watch error:", error);

      setError(
        error.message ||
          "Something went wrong while updating the watch."
      );
    } finally {
      setSaving(false);
    }
  };

  const removeWatch = async (id) => {
    if (!id) return;

    try {
      setDeletingId(id);
      setError("");

      const response = await fetch(
        `${WATCHES_API_URL}/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to delete watch."
        );
      }

      setWatches((current) =>
        current.filter((watch) => {
          const watchId = watch._id || watch.id;

          return watchId !== id;
        })
      );

      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Delete watch error:", error);

      setError(
        error.message ||
          "Something went wrong while deleting the watch."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const totalWatches = watches.length;

  const latestWatch =
    watches.length > 0
      ? watches[0]?.name || "PM Watch"
      : "—";

  return (
    <div className="admin-overlay">
      <div className="admin-panel premium-admin-panel">

        {/* HEADER */}
        <header className="premium-admin-header">
          <div className="premium-admin-brand">
            <div className="premium-admin-logo">
              PM
            </div>

            <div>
              <p className="premium-admin-kicker">
                PM WATCHES
              </p>

              <h2>Admin Dashboard</h2>

              <span>
                Manage your premium watch collection
              </span>
            </div>
          </div>

          <button
            className="premium-admin-close"
            onClick={onClose}
            aria-label="Close admin panel"
          >
            ×
          </button>
        </header>

        {/* STATS */}
        <section className="premium-admin-stats">

          <div className="premium-stat-card">
            <div className="premium-stat-top">
              <span>COLLECTION</span>

              <div className="premium-stat-icon">
                ◇
              </div>
            </div>

            <strong>{totalWatches}</strong>

            <p>Total watches</p>
          </div>

          <div className="premium-stat-card">
            <div className="premium-stat-top">
              <span>STATUS</span>

              <div className="premium-stat-icon">
                ✓
              </div>
            </div>

            <strong>Active</strong>

            <p>Store collection</p>
          </div>

          <div className="premium-stat-card">
            <div className="premium-stat-top">
              <span>LATEST</span>

              <div className="premium-stat-icon">
                ↗
              </div>
            </div>

            <strong className="premium-stat-latest">
              {latestWatch}
            </strong>

            <p>Latest collection item</p>
          </div>

        </section>

        {/* SECTION HEADER */}
        <div className="premium-admin-section-header">
          <div>
            <p className="premium-admin-kicker">
              COLLECTION
            </p>

            <h3>Your Watches</h3>

            <span>
              Add, edit and manage your products.
            </span>
          </div>

          {watches.length > 0 &&
            !isAdding &&
            !editingId && (
              <button
                className="premium-add-watch"
                onClick={startAdd}
              >
                <span>+</span>
                Add Watch
              </button>
            )}
        </div>

        {/* ERROR */}
        {error && (
          <div className="premium-admin-error">
            <span>!</span>
            {error}
          </div>
        )}

        {/* ADD WATCH */}
        {isAdding && (
          <div className="premium-product-editor">

            <div className="premium-editor-heading">
              <div>
                <p className="premium-admin-kicker">
                  NEW PRODUCT
                </p>

                <h3>Add New Watch</h3>

                <span>
                  Create a new PM Watch for your collection.
                </span>
              </div>

              <button
                className="premium-editor-close"
                onClick={cancelForm}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <div className="premium-editor-grid">

              <div className="premium-editor-image-column">

                <div className="premium-large-image-preview">
                  {form.image ? (
                    <img
                      src={form.image}
                      alt="Watch preview"
                    />
                  ) : (
                    <div className="premium-watch-placeholder">
                      <span>⌚</span>
                      <small>WATCH PREVIEW</small>
                    </div>
                  )}
                </div>

                <label className="premium-upload-button">
                  <span>↑</span>
                  Upload Product Image

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={saving}
                  />
                </label>

                <p className="premium-upload-note">
                  JPG, PNG or WEBP
                </p>

              </div>

              <div className="premium-editor-fields">

                <div className="premium-field">
                  <label>WATCH NAME</label>

                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g. PM Watch Pro"
                    disabled={saving}
                  />
                </div>

                <div className="premium-field">
                  <label>COLOR</label>

                  <input
                    value={form.color}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        color: e.target.value,
                      })
                    }
                    placeholder="e.g. Midnight Black"
                    disabled={saving}
                  />
                </div>

                <div className="premium-field">
                  <label>PRICE</label>

                  <input
                    value={form.price}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        price: e.target.value,
                      })
                    }
                    placeholder="e.g. ₹24,999"
                    disabled={saving}
                  />
                </div>

                <div className="premium-editor-actions">

                  <button
                    className="premium-save-button"
                    onClick={saveNewWatch}
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : "Save Watch"}
                  </button>

                  <button
                    className="premium-cancel-button"
                    onClick={cancelForm}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                </div>

              </div>
            </div>
          </div>
        )}

        {/* WATCH LIST */}
        <div className="premium-watch-list">

          {watches.length === 0 && !isAdding ? (
            <div className="premium-empty-state">

              <div className="premium-empty-icon">
                ⌚
              </div>

              <p className="premium-admin-kicker">
                EMPTY COLLECTION
              </p>

              <h3>No watches yet</h3>

              <span>
                Start building your PM Watches collection.
              </span>

              <button
                className="premium-add-watch"
                onClick={startAdd}
              >
                <span>+</span>
                Add First Watch
              </button>

            </div>
          ) : (
            watches.map((watch, index) => {
              const watchId =
                watch._id || watch.id;

              const isEditing =
                editingId === watchId;

              return (
                <div
                  className={`premium-product-card ${
                    isEditing
                      ? "premium-product-card-editing"
                      : ""
                  }`}
                  key={watchId}
                >

                  {isEditing ? (
                    <div className="premium-inline-editor">

                      <div className="premium-inline-editor-header">
                        <div>
                          <p className="premium-admin-kicker">
                            EDIT PRODUCT
                          </p>

                          <h3>
                            Update {watch.name}
                          </h3>
                        </div>

                        <button
                          className="premium-editor-close"
                          onClick={cancelForm}
                          disabled={saving}
                        >
                          ×
                        </button>
                      </div>

                      <div className="premium-inline-editor-grid">

                        <div className="premium-large-image-preview small">
                          {form.image ? (
                            <img
                              src={form.image}
                              alt="Watch preview"
                            />
                          ) : (
                            <div className="premium-watch-placeholder">
                              <span>⌚</span>
                            </div>
                          )}
                        </div>

                        <div className="premium-editor-fields">

                          <label className="premium-upload-button">
                            <span>↑</span>
                            Change Image

                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={saving}
                            />
                          </label>

                          <div className="premium-field">
                            <label>WATCH NAME</label>

                            <input
                              value={form.name}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  name: e.target.value,
                                })
                              }
                              disabled={saving}
                            />
                          </div>

                          <div className="premium-field">
                            <label>COLOR</label>

                            <input
                              value={form.color}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  color: e.target.value,
                                })
                              }
                              disabled={saving}
                            />
                          </div>

                          <div className="premium-field">
                            <label>PRICE</label>

                            <input
                              value={form.price}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  price: e.target.value,
                                })
                              }
                              disabled={saving}
                            />
                          </div>

                          <div className="premium-editor-actions">

                            <button
                              className="premium-save-button"
                              onClick={saveEdit}
                              disabled={saving}
                            >
                              {saving
                                ? "Saving..."
                                : "Save Changes"}
                            </button>

                            <button
                              className="premium-cancel-button"
                              onClick={cancelForm}
                              disabled={saving}
                            >
                              Cancel
                            </button>

                          </div>

                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="premium-product-number">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="premium-product-image">
                        {watch.image ? (
                          <img
                            src={watch.image}
                            alt={watch.name}
                          />
                        ) : (
                          <div className="premium-product-placeholder">
                            ⌚
                          </div>
                        )}
                      </div>

                      <div className="premium-product-info">

                        <p className="premium-product-category">
                          PM WATCH
                        </p>

                        <h3>{watch.name}</h3>

                        <span>{watch.color}</span>

                      </div>

                      <div className="premium-product-price">
                        <small>PRICE</small>

                        <strong>
                          {watch.price}
                        </strong>
                      </div>

                      <div className="premium-product-actions">

                        <button
                          className="premium-edit-button"
                          onClick={() =>
                            startEdit(watch)
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="premium-delete-button"
                          onClick={() =>
                            setShowDeleteConfirm(watchId)
                          }
                        >
                          Delete
                        </button>

                      </div>

                      {showDeleteConfirm ===
                        watchId && (
                        <div className="premium-delete-confirm">

                          <div>
                            <strong>
                              Remove this watch?
                            </strong>

                            <span>
                              This action cannot be undone.
                            </span>
                          </div>

                          <div className="premium-delete-actions">

                            <button
                              onClick={() =>
                                setShowDeleteConfirm(
                                  null
                                )
                              }
                              disabled={
                                deletingId === watchId
                              }
                            >
                              Cancel
                            </button>

                            <button
                              onClick={() =>
                                removeWatch(watchId)
                              }
                              disabled={
                                deletingId === watchId
                              }
                            >
                              {deletingId === watchId
                                ? "Removing..."
                                : "Remove"}
                            </button>

                          </div>

                        </div>
                      )}

                    </>
                  )}

                </div>
              );
            })
          )}

        </div>

        {/* FOOTER */}
        <div className="premium-admin-footer">
          <span>PM WATCHES</span>

          <span>
            Admin Dashboard · Product Management
          </span>
        </div>

      </div>
    </div>
  );
}